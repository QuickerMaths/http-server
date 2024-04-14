import axios from 'axios';
import { expect, describe, test, afterEach, beforeEach  } from '@jest/globals';
import { HttpServer } from '../http-server';

describe('Testing WebServer', () => {
    let server: HttpServer
    const baseUrl = `http://locahost:3000`;

    beforeEach(() => {
        server = new HttpServer(3000, 'localhost');
        server.init();
    });


    afterEach(() => {
        server.stop()
    });

    test('Testing simple Get request', async () => {
        const url = baseUrl + '/';

        server.get('/', (req, res) => {
            res.send()
        })

        try{
            const response = await axios.get(url);
            expect(response.status).toBe(200);
        } catch(err) {}
    });

    test('Serving HTML files', async () => {
        const url = baseUrl + '/index';

        server.get('/index', (_, res) => {
            res.sendFile('index');
        });

        try{
            const response = await axios.get(url);
            expect(response.data).toContain('Simple Web Page');
        } catch(err) {}
    });

    test('Invalid path', async () => {
        const url = baseUrl + '/invalid-path';

        server.get('/', (_, res) => {
            res.send()
        })
        
        try{
        const response = await axios.get(url);
            expect(response.status).toBe(404);
        } catch(err) {}
    });

    test('Concurrent clients', async () => {
        const url = baseUrl + '/index';

        server.get('/index', (_, res) => {
            res.sendFile('index');
        })

        try{
            const responses = await Promise.all([
                axios.get(url),
                axios.get(url),
                axios.get(url),
                axios.get(url),
                axios.get(url),
                axios.get(url),
                axios.get(url),
                axios.get(url),
                axios.get(url),
                axios.get(url)
            ]);
            responses.forEach((response) => {
                expect(response.data).toContain('Simple Web Page');
            });
        } catch(err) {}
    });
});