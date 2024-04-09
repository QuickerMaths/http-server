import net from 'net'

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
            socket.on('data', (chunk) => {
                console.log(chunk.toString())
                
                socket.end()
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
}