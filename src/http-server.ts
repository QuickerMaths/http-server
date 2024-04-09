import net from 'net'
import { HttpRequest } from './request';

interface IHttpServer {
    host: string;
    port: number;
    server: net.Server
    init(): void
    stop(): void
    restart(): void
}

export class HttpServer implements IHttpServer {
    port;
    host;
    server;

    constructor(
        port: number = 80,
        host: string = '127.0.0.1',
    ) {
        this.port = port;
        this.host = host;
        this.server = new net.Server() 
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

        if(this.server.listening){
            this.server.close()
        }

        this.server.on('connection', (socket) => {
            socket.on('data', (data) => {
                const request = data.toString()

                const parsedRequest = this.parseRequest(socket, request)
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

    private parseRequest(socket: net.Socket, request: string) {
        const [headers, ...body] = request.split('\r\n\r\n')
        const reqHeaders =  headers.split('\r\n')

        const [method, path, httpVersionWithProtocol] = (reqHeaders.shift() as string).split(' ')
        const httpVersion = httpVersionWithProtocol.split('/')[1]

        const parsedHeaders = reqHeaders.reduce((acc, currentHeader) => {
            const [key, value] = currentHeader.split(':');
            return {
              ...acc,
              [key.trim().toLowerCase()]: value.trim()
            };
        }, {});

        return new HttpRequest(method, path, httpVersion, parsedHeaders, body, socket)
    }
}