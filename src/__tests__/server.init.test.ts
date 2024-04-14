import { HttpServer } from "../http-server";
import { describe, expect, jest, it, afterEach, beforeEach } from '@jest/globals'
import net from 'net';

describe('server.init()', () => {
    let server: HttpServer
    let mockNet: net.Server

    beforeEach(() => {
        mockNet = new net.Server();
        jest.spyOn(net, 'Server').mockImplementation(() => mockNet);
        server = new HttpServer(3000, 'localhost');
    });

    afterEach(() => {
        server.stop()
    })

    it('should start listening on the correct host and port', () => {
        const listenSpy = jest.spyOn(mockNet, 'listen');

        server.init();

        expect(listenSpy).toHaveBeenCalledWith(3000, 'localhost');
        expect(server.host).toBe('localhost')
        expect(server.port).toBe(3000)
    });

    it('should handle connection errors', () => {
        const errorSpy = jest.spyOn(mockNet, 'on');

        server.init();

        expect(errorSpy).toHaveBeenCalledWith('error', expect.any(Function));
    });

    it('should start server on another port when address is in use', () => {
        const secondServer = new HttpServer(3000, 'localhost');

        server.init()

        setTimeout(() => {
            secondServer.init()
            expect(secondServer.port).toBe(3001)
        }, 1000)
    });
    
    it('should handle connection', () => {
        const connectionSpy = jest.spyOn(mockNet, 'on');

        server.init();
        
        expect(connectionSpy).toHaveBeenCalledWith('connection', expect.any(Function));
    });
});