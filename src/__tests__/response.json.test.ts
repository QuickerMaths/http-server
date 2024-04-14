import { HttpResponse } from '../response';
import net from 'net';
import { describe, beforeEach, test, expect, jest, afterEach } from '@jest/globals';

describe('response.json()', () => {
    let httpResponse: HttpResponse
    let mockSocket: net.Socket
    let mockWrite: any
    let setHeaderMock: any
    let sendHeadersMock: any

    beforeEach(() => {
        mockSocket = new net.Socket();
        mockWrite = jest.spyOn(mockSocket, 'write')
        setHeaderMock = jest.spyOn(HttpResponse.prototype, 'setHeader')
        sendHeadersMock = jest.spyOn(HttpResponse.prototype as any, '_sendHeaders')
        httpResponse = new HttpResponse(mockSocket);
    });

    afterEach(() => {
        mockSocket.destroy()
    })
    
    test('send method with object body', () => {
        httpResponse.json({ message: 'Hello, world!' });

        expect(setHeaderMock).toBeCalledWith('date', new Date().toUTCString()) 
        expect(setHeaderMock).toBeCalledWith('Content-Length', 27) 
        expect(setHeaderMock).toBeCalledWith('Content-Type', 'application/json; charset=utf-8') 
        expect(sendHeadersMock).toBeCalled() 
        expect(mockWrite).toHaveBeenCalledWith('{"message":"Hello, world!"}\r\n');
    });
});