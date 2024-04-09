import { HttpServer } from "./http-server";

const server = new HttpServer(8080, '127.0.0.1')

server.init()
