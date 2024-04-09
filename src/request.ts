import net from 'net'

interface IHttpRequest {
    method: string;
    path: string;
    httpVersion: string;
    headers: Record<string, string>;
    body: string[];
    socket: net.Socket;
}

export class HttpRequest implements IHttpRequest {
    method;
    path;
    httpVersion;
    headers;
    body;
    socket;

    constructor(
        method: string,
        path: string,
        httpVersion: string,
        headers: Record<string, string>,
        body: string[],
        socket: net.Socket,
    ) {
        this.method = method,
        this.path = path,
        this.httpVersion = httpVersion,
        this.headers = headers,
        this.body = body,
        this.socket = socket
    }
}