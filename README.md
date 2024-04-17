# http-server

This project is my solution to one of [John's Cricket](https://www.linkedin.com/in/johncrickett/?originalSubdomain=uk) coding challanges. 
I've build it using NodeJS net module, I choose this option instead of http module to understand more about how servers works and how to properly handle http request. 

# Overview 
Project has 3 main files http-server.ts, response.ts and request.ts

## Class: Request

The `Request` class is created after the server reads and parses an incoming request. It stores processed data such as headers, parameters, request body, path, method, etc.

### Properties

- `headers`: The headers of the incoming request.
- `params`: The parameters of the incoming request.
- `body`: The body of the incoming request.
- `path`: The path of the incoming request.
- `method`: The HTTP method of the incoming request.
- `queryParmas`: query parameters from incoming request.
- `url`: url of the incoming request.
- `httpVersion`: httpVersion of the incoming request.

### Methods

- `getHeader()`: This method reads from the `headers` array and returns the value of a header based on the given key.

## Class: Response

The `Response` class is responsible for setting the `statusCode`, `statusText`, and `headers` of the server's response to incoming requests. It provides methods to set these properties individually or all at once, and it provides several ways to send a response to the client.

### Properties

- `headersSent`: A boolean that indicates if headers were already sent to the client. If `true`, an error will be thrown when trying to send headers again, as headers can only be sent once.

### Methods

- `setStatusCode()`: Sets the status code of the response.
- `setStatusText()`: Sets the status text of the response.
- `setHeaders()`: Sets the headers of the response.
- `setHead()`: A convenience method that sets the status code, status text, and headers all at once.
- `send()`: Sends the response to the client. This method takes an optional `body` argument and decides how to send the response body based on its type. If the body is a string, it sets the `Content-Type` to `text/html`. If the body is an object, boolean, or number, it checks if the body is a buffer. If so, it sets the `Content-Type` as `application/octet-stream`. If not, it calls the `json()` method. Before sending the response to the client, `send()` sets the `Content-Length` header to the appropriate value.
- `json()`: Sets the `Content-Type` to `application/json`, sets the `Content-Length` header, and sends the response body in JSON format.
- `sendFile()`: Sends an HTML file as a response. This method receives a `path` argument that is validated by the `validatePath` utility function (only files inside the `/src/www/` directory are allowed). If the path is valid, `sendFile()` uses the asynchronous `readFile` function from Node.js's `fs` module to first check if the file exists (if not, it sends a 404 response) and then sends the retrieved HTML file with `Content-Type` set to `text/html`.

### Private Methods

- `_sendHeaders()`: Checks if headers have already been sent to the client. If so, it throws an error. If not, it sets the `headersSent` property to `true`, sets all previously set headers, and adds a `Date` header.
- `getHeader()`: A simple method that reads from the `headers` array.

## Class: Http-Server

This is the core class of the application. As mentioned before it uses net module from NodeJS to create a TCP server that can handle http requests. It takes two 
arguments port and host.

### Properties

- `host`: host address that server is set on.
- `port`: port that server is lisening to.
- `server`: simply `net.Server()`
- `listeners`: private property of the `HttpServer` class. It is a `Map` where each key is a string that represents a combination of an HTTP method and a path (e.g., 'GET /users'), and each value is an object of type `RouteType`.

`RouteType` is an object that includes:

- `cb`: This is a callback function that gets executed when a request matches the route. It takes two arguments: a request object and a response object.
- `keys`: This is an array of `Key` objects from the `path-to-regexp` (borrowed that from express) library. Each `Key` represents a dynamic part of the path (e.g., in '/users/:id', 'id' is a dynamic part).
- `pathRegex`: This is a regular expression generated from the path using the `path-to-regexp` library. It is used to match incoming requests to the correct route.

### Methods

- `init()`: method is responsible for initializing the server. It sets up the server to listen on the specified host and port, and configures event handlers for the server and its connections. Init events:
    * `error`: An event handler is set up for the 'error' event. If the error code indicates that the server is already listening or the address is in use, the port number is     incremented and the server attempts to listen again. For any other error, the error is thrown.
    * `connection`: An event handler is set up for the 'connection' event. This event is emitted whenever a new connection is made to the server.
    * `data`: Within the 'connection' event handler, another event handler is set up for the 'data' event on the socket. This event is emitted whenever data is received from the client. The data is converted to a string and passed to the `_parseRequest()` method to create a `HttpRequest()` object. A `HttpResponse()` object is also created, and both objects are passed to the `_forwardRequestToListener()` method.
    * `error`: Another event handler within the 'connection' event handler is set up for the 'error' event on the socket. If the error code indicates that the connection was reset or the socket is not writable, the connection is ended with a '400 Bad Request' response.
- `stop()`: stops the server.
- `restart()`: stops the server and starts to listen on the same port and host.
- `get()` and `post()` - takes two parameters path and the callback function to execute when a request is received on the specified path. This function should accept two arguments: a request object and a response object. Method first creates an array of `Key` objects and a regular expression from the path using the `pathToRegexp` function. Each `Key` object represents a dynamic part of the path. It then creates a `route` object that includes the callback function, the array of `Key` objects, and the regular expression. Finally, it adds the `route` object to the `listeners` map with a key that combines the HTTP method (GET) and the path.

### Private Methods

- `_parseRequest()`: This private method is responsible for parsing an incoming request and creating a new `HttpRequest` object from the parsed data. Here's how it works:
- `_createParams()`: This private method is responsible for creating a `params` object from the path of the incoming request. It starts by creating an empty `params` object. It then finds a matching route from the `listeners` map using the path of the incoming request. If a matching route is found, it executes the route's regular expression against the path to get a match. If a match is found, it iterates over the keys of the matching route. For each key, it adds a new property to the `params` object where the property name is the key name and the property value is the corresponding matched value from the path. Finally, it returns the `params` object.
- `_parseHeaders()`: This private method is responsible for parsing the headers of the incoming request using `reduce()` and `split()` funtcions.
- `_forwardRequestToListener()`: This private method is responsible for forwarding the request and response to the appropriate listener. It starts by finding a matching route from the `listeners` map using the path of the incoming request. If a matching route is found, it calls the callback function of the matching route with the request and response as arguments. If no matching route is found, it sets the response status to '404 Not Found' and sends the response.





