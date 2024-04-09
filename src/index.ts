import { HttpServer } from "./http-server";

const server = new HttpServer(8080, 'localhost')

server.init()
