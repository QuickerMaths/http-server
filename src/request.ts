import net from 'net'

export interface IHttpRequest {
    method: string;
    path: string;
    httpVersion: string;
    headers: Record<string, string>;
    body: string[];
    queryParams: URLSearchParams | {};
    url: URL;
    getHeader(name: string): string;
}

export class HttpRequest implements IHttpRequest {
    method;
    path;
    httpVersion;
    headers;
    body;
    queryParams;
    url;
    private socket: net.Socket

    constructor(
        method: string,
        path: string,
        httpVersion: string,
        headers: Record<string, string>,
        body: string[],
        queryParams: URLSearchParams | {},
        url: URL,
        socket: net.Socket,
    ) {
        this.method = method,
        this.path = path,
        this.httpVersion = httpVersion,
        this.headers = headers,
        this.body = body || {},
        this.queryParams = queryParams || {},
        this.url = url,
        this.socket = socket
    }

    getHeader(name: string){
        return this.headers[name.toLowerCase()]
    }
}