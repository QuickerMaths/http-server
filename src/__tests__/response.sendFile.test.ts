import fs from 'fs';
import { HttpResponse } from '../response';
import net from 'net';
import { describe, beforeEach, test, expect, jest, afterEach } from '@jest/globals';
import * as validatePath from '../utils';

describe('response.sendFile()', () => {
    let httpResponse: HttpResponse
    let mockSocket: net.Socket
    let sendSpy: any
    let validatePathSpy: any
    let setHeadSpy: any
    let readValidPathSpy: any
    let readNonexistingPathSpy: any

    beforeEach(() => {
        mockSocket = new net.Socket();
        httpResponse = new HttpResponse(mockSocket);
        validatePathSpy = jest.spyOn(validatePath, 'validatePath')
        sendSpy = jest.spyOn(HttpResponse.prototype, 'send')
        setHeadSpy = jest.spyOn(HttpResponse.prototype, 'setHead')
        readValidPathSpy = jest.spyOn(fs, 'readFile').mockImplementationOnce(() => {
            httpResponse.send()
        })
        readNonexistingPathSpy = jest.spyOn(fs, 'readFile').mockImplementationOnce(() => {
            httpResponse.setHead(404, 'Not Found')
            httpResponse.send()
        })
    });

    afterEach(() => {
        mockSocket.destroy()
    })

    test('sendFile method with valid file path', () => {
        const validPath = 'index';

        httpResponse.sendFile(validPath);

        expect(validatePathSpy).toBeCalledWith(validPath)
        expect(readValidPathSpy).toBeCalled()
        expect(sendSpy).toBeCalled()
    });

    test('sendFile method with non existing file path throws and sets head to 404 Not Found', () => {
        const nonexisting = 'nonexisting';

        httpResponse.sendFile(nonexisting);

        expect(validatePathSpy).toBeCalledWith(nonexisting)
        expect(readNonexistingPathSpy).toBeCalled()
        expect(setHeadSpy).toBeCalledWith(404, 'Not Found')
        expect(sendSpy).toBeCalled()
    });
});