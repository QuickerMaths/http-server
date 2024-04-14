import { HttpResponse } from '../response';
import net from 'net';
import { describe, beforeEach, test, expect, jest, afterEach } from '@jest/globals';

describe('response.send()', () => {
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

    test('send method with string body', () => {
        httpResponse.send('Hello, world!');

        expect(setHeaderMock).toBeCalledWith('date', new Date().toUTCString()) 
        expect(setHeaderMock).toBeCalledWith('Content-Type', 'text/html; charset=utf-8') 
        expect(setHeaderMock).toBeCalledWith('Content-Length', 13)
        expect(sendHeadersMock).toBeCalled()
        expect(mockWrite).toHaveBeenCalledWith('Hello, world!\r\n');
    });
    
    test('send method with object body', () => {
        const jsonSpy = jest.spyOn(httpResponse, 'json');
        
        httpResponse.send({ message: 'Hello, world!' });
        
        expect(jsonSpy).toHaveBeenCalledWith({ message: 'Hello, world!' });
        expect(setHeaderMock).toBeCalledWith('date', new Date().toUTCString()) 
        expect(setHeaderMock).toBeCalledWith('Content-Length', 27) 
        expect(setHeaderMock).toBeCalledWith('Content-Type', 'application/json; charset=utf-8') 
        expect(sendHeadersMock).toBeCalled()
        expect(mockWrite).toHaveBeenCalledWith('{"message":"Hello, world!"}\r\n');
    });
    
    test('send method with Buffer body', () => {
        const buffer = Buffer.from('Hello, world!', 'utf-8');
        
        httpResponse.send(buffer);

        expect(setHeaderMock).toBeCalledWith('date', new Date().toUTCString()) 
        expect(setHeaderMock).toBeCalledWith('Content-Type', 'application/octet-stream') 
        expect(sendHeadersMock).toBeCalled()
        expect(mockWrite).toHaveBeenCalledWith(`${buffer}\r\n`);
    });
    
    test('send method with no body', () => {
        httpResponse.send();
        expect(setHeaderMock).toBeCalledWith('date', new Date().toUTCString()) 
        expect(sendHeadersMock).toBeCalled()
        expect(mockWrite).not.toHaveBeenCalledWith();
    });
});