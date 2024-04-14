import { HttpResponse } from '../response';
import net from 'net';
import { describe, beforeEach, test, expect, jest, afterEach } from '@jest/globals';

describe('response._sendHeaders()', () => {
    let httpResponse: HttpResponse
    let mockSocket: net.Socket

    beforeEach(() => {
        mockSocket = new net.Socket();
        httpResponse = new HttpResponse(mockSocket);
    });

    afterEach(() => {
        mockSocket.destroy()
    })

    test('sendHeaders method', () => {
        const mockWrite = jest.spyOn(mockSocket, 'write')
        httpResponse.setHead(200, 'OK', { 'Content-Type': 'text/html' });
        httpResponse['_sendHeaders']();
        expect(mockWrite).toHaveBeenCalledWith('HTTP/1.1 200 OK\r\n');
        expect(mockWrite).toHaveBeenCalledWith('date: ' + new Date().toUTCString() + '\r\n');
        expect(mockWrite).toHaveBeenCalledWith('Content-Type: text/html\r\n');
        expect(mockWrite).toHaveBeenCalledWith('\r\n');
    });

    test('sendHeaders method throws error if headers already sent', () => {
        httpResponse.setHead(200, 'OK', { 'Content-Type': 'text/html' });
        httpResponse['_sendHeaders']();
        expect(() => httpResponse['_sendHeaders']()).toThrow('Cannot send headers. Headers already send!');
    });
});