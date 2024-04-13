import net from 'net'
import { Buffer } from 'node:buffer'
import fs from 'fs'
import { validatePath } from './utils';

export interface IHttpResponse {
    statusCode: number;
    statusText: string;
    headers: Record<string, string | number | boolean>;
    headersSent: boolean;
    setStatusCode(status: number): void;
    setStatusText(text: string): void;
    setHeader(key: string, value: string | boolean | number): void;
    setHead(statusCode?: number, statusText?: string, headers?: Record<string, string | boolean>): void;
    send(body?: any): void;
    json(body: any): void;
    sendFile(path: string): void;
}

export class HttpResponse implements IHttpResponse {
    private socket;
    statusCode;
    statusText;
    headers;
    headersSent;

    constructor(
        socket: net.Socket,
        statusCode: number = 200,
        statusText: string = "OK",
        headers: Record<string, string | number | boolean> = {},
        headersSend: boolean = false,
    ){  
        this.socket = socket;
        this.statusCode = statusCode;
        this.statusText = statusText;
        this.headers = headers;
        this.headersSent = headersSend;
    }

    setStatusCode(statusCode: number) {
        this.statusCode = statusCode
    }

    setStatusText(statusText: string) {
        this.statusText = statusText
    }

    setHeader(key: string, value: string | number | boolean): void {
        this.headers = {
            ...this.headers,
            [key.toLowerCase().trim()]: value
        }
    }

    setHead(statusCode: number = this.statusCode, statusText: string = this.statusText, headers: Record<string, string | number | boolean> = this.headers) {
        this.statusCode = statusCode
        this.statusText = statusText    
        this.headers = {
            ...this.headers, 
            ...headers
        }
    }

    send(body?: any) {
        if(body !== undefined){
            switch(typeof body) {
                case 'string':
                    if(!this._getHeader('Content-Type')) this.setHeader('Content-Type', 'text/html; charset=utf-8');
                    break;
                case 'boolean':
                case 'number':
                case 'object':
                    if (Buffer.isBuffer(body)){
                        if(!this._getHeader('Content-Type')) this.setHeader('Content-Type', 'application/octet-stream')
                    } else {
                        return this.json(body)
                    }
            }   

            if(!this._getHeader('Content-Length')){
                if(Buffer.isBuffer(body)){
                    this.setHeader('Content-Length', body.length)
                } else {
                    const buffer = Buffer.from(body)
                    this.setHeader('Content-Length', buffer.length)
                }
            }


            this._sendHeaders()

            if(body) this.socket.write(`${body}\r\n`)
        }

        if(!this.headersSent) this._sendHeaders()
        this.socket.end()
    }

    json(body: any) {
        const json = Buffer.from(JSON.stringify(body));

        this.setHeader('Content-Type', 'application/json; charset=utf-8');
        this.setHeader('Content-Length', json.length);

        this._sendHeaders()

        this.socket.write(`${json}\r\n`)
        this.socket.end()
    }

    sendFile(path: string): void {
        const validatedPath = validatePath(path)

        fs.readFile(validatedPath, (err, data) => {
            try {
                if(err) throw err   
                this.send(data.toString())
            } catch(err) {
                console.log(err)
                this.setHead(404, 'Not found')
                this.send()
            }
        })
    }

    private _sendHeaders() {
        if(this.headersSent) throw Error('Cannot send headers. Headers already send!')

        this.headersSent = true

        this.socket.write(`HTTP/1.1 ${this.statusCode} ${this.statusText}\r\n`);
            
        this.setHeader('date', new Date().toUTCString()) 

        Object.keys(this.headers).forEach(headerKey => {
            this.socket.write(`${headerKey}: ${this.headers[headerKey]}\r\n`);
        });

        this.socket.write('\r\n');
    }

    private _getHeader(key: string): unknown  {
        if(this.headers[key.toLowerCase().trim()]) return this.headers[key]
        return null
    }
}  