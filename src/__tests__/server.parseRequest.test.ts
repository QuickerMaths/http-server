import { HttpServer } from "../http-server";
import { beforeAll, describe, expect, it, jest } from '@jest/globals'

describe('HttpServer', () => {
    let server: HttpServer;
    beforeAll(() => {
        server = new HttpServer(3000, 'localhost')
    })

    describe('server._parseRequest()', () => {
        it('should parse a request string into an HttpRequest object', () => {
            server.get('/test/:id', jest.fn())
            const socketMock: any = jest.fn();
            const request = 'GET /test/123?test=123 HTTP/1.1\r\nHost: localhost:3000\r\nContent-Type: text/html\r\n\r\nbody';
            const { 
                method,
                path, 
                httpVersion, 
                headers, 
                body, 
                url, 
                params, 
                queryParams 
            } = server['parseRequest'](socketMock, request);

            expect(method).toEqual('GET');
            expect(path).toEqual('/test/123');
            expect(httpVersion).toEqual('1.1');
            expect(headers).toEqual({ 
                'host': 'localhost:3000', 
                'content-type': 'text/html'
            })
            expect(body).toEqual(['body'])
            expect(url.toString()).toEqual('http://localhost:3000/test/123?test=123')
            expect(params).toEqual({ 'id': '123'})
            expect(queryParams.toString()).toEqual('test=123')
        });
    });
});