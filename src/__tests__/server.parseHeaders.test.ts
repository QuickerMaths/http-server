import { HttpServer } from "../http-server";
import { beforeAll, describe, expect, it } from '@jest/globals'

describe('HttpServer', () => {
    let server: HttpServer;

    beforeAll(() => {
        server = new HttpServer(3000, 'localhost')
    })

    describe('server._parseHeaders()', () => {
        it('should parse headers into a key-value pair', () => {
            const headers = ['Host: localhost', 'Content-Type: application/json'];
            const result = server['_parseHeaders'](headers);
            expect(result).toEqual({
                'host': 'localhost',
                'content-type': 'application/json'
            });
        });
    });
});