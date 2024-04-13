import { HttpServer } from "../http-server";
import { describe, expect, jest, it, afterAll } from '@jest/globals'
import net from 'net';


describe('server.restart()', () => {
    const mockNet = new net.Server();
    jest.spyOn(net, 'Server').mockImplementation(() => mockNet);
    const server = new HttpServer(3000, 'localhost');

    afterAll(() => {
        server.stop()
    })

    it('should restart sever', () => {
        const listenSpy = jest.spyOn(mockNet, 'listen')
        const stopSpy = jest.spyOn(server, 'stop')
        server.init()

        expect(listenSpy).toHaveBeenCalledWith(3000, 'localhost')
        
        server.restart()
        
        expect(stopSpy).toHaveBeenCalled()
        expect(listenSpy).toHaveBeenCalledWith(3000, 'localhost')
    })
})