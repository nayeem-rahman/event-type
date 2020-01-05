# event-type

A general purpose, promise based event system.

[![Build Status](https://github.com/nayeemrmn/event-type/workflows/ci/badge.svg?branch=master&event=push)](https://github.com/nayeemrmn/event-type/actions)

## Usage

Attach some event emitter using `EventType.prototype.dispatch()`:
```js
import { EventType } from "event-type";
import http from "http";

const httpRequests = new EventType();

http.createServer((request, response) => {
  httpRequests.dispatch([request, response]);
}).listen(8000);
```
Listen for a single event using `EventType.prototype.listen()`:
```js
httpRequests.listen().then(([request, response]) => {
  console.log(`${request.method} ${request.url}`);
  response.writeHead(200, {"Content-Type": "text/plain"});
  response.end("Hello, World!\n");
});
```
Keep listening for events:
```js
/* --async context-- */
while (true) {
  const [request, response] = await httpRequests.listen();
  console.log(`${request.method} ${request.url}`);
  response.writeHead(200, {"Content-Type": "text/plain"});
  response.end("Hello, World!\n");
}
```
Or, most preferably, leverage `EventType.prototype[Symbol.asyncIterator]()`:
```js
/* --async context-- */
for await (const [request, response] of httpRequests) {
  console.log(`${request.method} ${request.url}`);
  response.writeHead(200, {"Content-Type": "text/plain"});
  response.end("Hello, World!\n");
}
```

## Examples

Multiplex two sources of events:
```js
import { EventType } from "event-type";
import http from "http";

const httpRequests = new EventType();

http.createServer(function (request, response) {
  httpRequests.dispatch([request, response]);
}).listen(8000);

http.createServer(function (request, response) {
  httpRequests.dispatch([request, response]);
}).listen(9000);

/* --async context-- */
for await (const [request, response] of httpRequests) {
  console.log(`${request.method} ${request.url}`);
  response.writeHead(200, {"Content-Type": "text/plain"});
  response.end("Hello, World!\n");
}
```
