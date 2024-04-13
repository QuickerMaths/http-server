import { HttpServer } from "../http-server";
import { beforeAll, describe, expect, it, jest } from '@jest/globals'

describe('HttpServer', () => {
    let server: HttpServer;

    beforeAll(() => {
        server = new HttpServer(3000, 'localhost')
    })

    describe('server._forwardRequestToListener()', () => {
        it('should forward request to matching listener', () => {
            server.get('/test/:id', jest.fn());

            const requestMock: any = { path: '/test/123', method: 'GET' };
            const responseMock: any = { setHead: jest.fn(), send: jest.fn() };
            const matchingRouteMock = Array.from(server['listeners'].values())
                .find(route => route.pathRegex.test(requestMock.path));

            server['_forwardRequestToListener'](requestMock, responseMock);

            expect(matchingRouteMock?.cb).toHaveBeenCalledWith(requestMock, responseMock)
        });

        it('should respond with 404 when no matching listener', async () => {
            const requestMock: any = { path: '/nonexistent', method: 'GET' };
            const responseMock: any = { setHead: jest.fn(), send: jest.fn() };

            server['_forwardRequestToListener'](requestMock, responseMock);
            
            expect(responseMock.setHead).toHaveBeenCalledWith(404, 'Not Found');
            expect(responseMock.send).toHaveBeenCalled();
        });
    });
});