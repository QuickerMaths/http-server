import net from 'net'
import { Key, pathToRegexp } from 'path-to-regexp'
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
    post(path: string, cb: (request: IHttpRequest, response: IHttpResponse) => void): void
}

type RouteType = {
    cb: (request: IHttpRequest, response: IHttpResponse) => void,
    keys: Key[],
    pathRegex: RegExp
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
        this.listeners = new Map<string, RouteType>()
    }

    init() {
        this.server.on('error', (e: any) => {
            if(e.code === 'ERR_SERVER_ALREADY_LISTEN' || e.code === 'EADDRINUSE') {
                this.port++;
                this.server.listen(this.port, this.host);
            } else {
                throw e;
            }
        });

         this.server.listen(this.port, this.host)

        this.server.on('connection', (socket) => {
            socket.on('data', (data) => {
                const input = data.toString()

                const request = this._parseRequest(socket, input)
                const response = new HttpResponse(socket)

                this._forwardRequestToListener(request, response)
            }) 

            socket.on('error', (error: any) => {
                if (error.code === 'ECONNRESET' || !socket.writable) socket.end('HTTP/1.1 400 Bad Request\n');
            })
        })
    }

    stop() {
        this.server.close()
    }

    restart(){ 
        this.stop()
        this.server.listen(this.port, this.host, () => {
        })
    }

    get(path: string, cb: (request: IHttpRequest, response: IHttpResponse) => void): void { 
        const keys: Key[] = []
        const pathRegex = pathToRegexp(path, keys)

        const route = {
            cb,
            keys,
            pathRegex
        }
        
        this.listeners.set('GET ' + path, route);
    }


    post(path: string, cb: (request: IHttpRequest, response: IHttpResponse) => void): void { 
        const keys: Key[] = []
        const pathRegex = pathToRegexp(path, keys)

        const route = {
            cb,
            keys,
            pathRegex
        }
        
        this.listeners.set('POST ' + path, route);
    }
    
    private _parseRequest(socket: net.Socket, request: string): IHttpRequest {
        const [headers, ...body] = request.split('\r\n\r\n')
        const reqHeaders =  headers.split('\r\n')

        const [method, reqPath, httpVersionWithProtocol] = (reqHeaders.shift() as string).split(' ')
        const httpVersion = httpVersionWithProtocol.split('/')[1]

        const parsedHeaders = this._parseHeaders(reqHeaders)

        const url = new URL(reqPath, `http://${parsedHeaders.host}`)
        const queryParams = url.searchParams
        const path = url.pathname

        const params = this._createParams(path)

        return new HttpRequest(method, path, httpVersion, parsedHeaders, body, queryParams, params, url, socket)
    }

    private _createParams(path: string): Record<string, string> {
        const params: Record<string, string> = {};
        const matchingRoute = Array.from(this.listeners.values()).find(route => route.pathRegex.test(path));
        if (matchingRoute) {
            const match = matchingRoute.pathRegex.exec(path);
            if (match) {
                matchingRoute.keys.forEach((key, index) => {
                    params[key.name] = match[index + 1];
                });
            }
        }

        return params;
    }

    private _parseHeaders(headers: string[]): Record<string, string> {
        const parsedHeaders: Record<string, string> = headers.reduce((acc, currentHeader) => {
            const [key, value] = currentHeader.split(': ');
            return {
                ...acc,
                [key.trim().toLowerCase()]: value.trim()
            };
        }, {});

        return parsedHeaders
    }

    private async _forwardRequestToListener(request: IHttpRequest, response: IHttpResponse) {
        const matchingRoute = Array.from(this.listeners.values()).find(route => route.pathRegex.test(request.path));

        if(matchingRoute){
            matchingRoute.cb(request, response)
        } else {
            response.setHead(404, 'Not Found')
            response.send();
        }
    }
}
