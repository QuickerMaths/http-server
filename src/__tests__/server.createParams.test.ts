import { HttpServer } from "../http-server";
import { beforeAll, describe, expect, it, jest } from '@jest/globals'

describe('HttpServer', () => {
    let server: HttpServer;

    beforeAll(() => {
        server = new HttpServer(3000, 'localhost')
    })

    describe('server._createParams()', () => {
        it('should set params to empty object', () => {
            server.get('/test', jest.fn());

            const params = server['_createParams']('/test');
            expect(params).toEqual({});
        });

        it('should create params from a path', () => {
            server.get('/test/:id', jest.fn());

            const params = server['_createParams']('/test/123');
            expect(params).toEqual({ id: '123' });
        });
    });
});