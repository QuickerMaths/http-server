import net from 'net'
import { HttpRequest, IHttpRequest } from './request';
import { HttpResponse, IHttpResponse } from './response';

interface IHttpServer {
    host: string;
    port: number;
    server: net.Server
    init(): void
    stop(): void
    restart(): void
    get(path: string, cb: (request: IHttpRequest, response: IHttpResponse) => void): void
}

export class HttpServer implements IHttpServer {
    port;
    host;
    server;
    private listeners;

    constructor(
        port: number = 80,
        host: string = '127.0.0.1',
    ) {
        this.port = port;
        this.host = host;
        this.server = new net.Server() 
        this.listeners = new Map<string, (request: IHttpRequest, response: IHttpResponse) => void>()
    }

    init() {
        this.server.on('error', (e: any) => {
            if (e.code === 'EADDRINUSE') {
                console.log('Address in use, retrying...');
                setTimeout(() => this.restart(), 1000);
            }
        });

        this.server.listen(this.port, this.host, () => {
            console.log(`Server started listening on ${this.host}:${this.port}`)
        })

        this.server.on('connection', (socket) => {
            socket.on('data', (data) => {
                const request = data.toString()

                const parsedRequest = this.parseRequest(socket, request)
                const response = new HttpResponse(socket)

                this.forwardRequestToListener(parsedRequest, response)
            }) 

            socket.on('error', (error: any) => {
                if (error.code === 'ECONNRESET' || !socket.writable) socket.end('HTTP/1.1 400 Bad Request\n');
                console.log('client error\n', error);
            })
        })
    }

    stop() {
        this.server.close()
    }

    restart(){ 
        this.stop()
        this.server.listen(this.port, this.host, () => {
            console.log(`Server restarted and listening on ${this.host}:${this.port}`)
        })
    }

    get(path: string, cb: (request: IHttpRequest, response: IHttpResponse) => void): void { 
        this.listeners.set('GET ' + path, cb);
    }
    

    private parseRequest(socket: net.Socket, request: string): IHttpRequest {
        const [headers, ...body] = request.split('\r\n\r\n')
        const reqHeaders =  headers.split('\r\n')

        const [method, reqPath, httpVersionWithProtocol] = (reqHeaders.shift() as string).split(' ')
        const httpVersion = httpVersionWithProtocol.split('/')[1]

        const parsedHeaders: Record<string, string> = reqHeaders.reduce((acc, currentHeader) => {
            const [key, value] = currentHeader.split(': ');
            return {
              ...acc,
              [key.trim().toLowerCase()]: value.trim()
            };
        }, {});

        const url = new URL(reqPath, `http://${parsedHeaders.host}`)
        const queryParams = url.searchParams
        const path = url.pathname

        return new HttpRequest(method, path, httpVersion, parsedHeaders, body, queryParams, url, socket)
    }

    private async forwardRequestToListener(request: IHttpRequest, response: IHttpResponse) {
        const key = `${request.method.toUpperCase()} ${request.path}`;
    
        if (this.listeners.has(key)) {
            try {
                const cb = this.listeners.get(key)!;
                cb(request, response);
            } catch (e) {
              response.setHead(500, 'Internal server Error')
              response.send();
            }
            return;
        }

        response.setHead(404, 'Not Found')
        response.send();
      }
}