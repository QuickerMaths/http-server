import { HttpServer } from "../http-server";
import { afterEach, beforeAll, beforeEach, describe, expect, it, jest } from '@jest/globals'

describe('HttpServer', () => {
    let server: HttpServer;

    beforeAll(() => {
        server = new HttpServer(3000, 'localhost')
    })

    describe('parseHeaders', () => {
        it('should parse headers into a key-value pair', () => {
            const headers = ['Host: localhost', 'Content-Type: application/json'];
            const result = server['parseHeaders'](headers);
            expect(result).toEqual({
                'host': 'localhost',
                'content-type': 'application/json'
            });
        });
    });
});