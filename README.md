# node-mux

## Installation

`npm i wright-jordan/node-mux`

## Getting Started

1. `import { App, Handler, Handlers, Middleware, Mux } from 'mux';`

2. Create `Handler` functions to populate a `Handlers` object.

```
const handler: Handler = async function (r, w, ctx) {
  w.statusCode = 200;
  w.end(JSON.stringify({ hello: "world" }));
};

const handlers: Handlers = {
  "/": handler,
};
```

3. Create a 404 `Handler`.

```
const _404: Handler = async function (r, w, ctx) {
  w.statusCode = 404;
  w.end();
};
```

4. Create `Middleware`.

```
declare module "mux" {
  interface Ctx {
    data?: string;
  }
}

const mw: Middleware = async function (next) {
  return async function (r, w, ctx) {
    console.log("I run before the handler.")

    ctx.data = "I am accessible in future middleware and in the handler.";

    await next(r, w, ctx);

    console.log("I run after the handler.")
  };
};
```

5. Pass your `Handlers` and 404 `Handler` to `Mux()`.

```
const mux = Mux(handlers, _404);
```

6. The generated value is a special `Handler` that should be wrapped in `Middleware` and passed to `App()`.

```
const app = App(await mw(mux));
```

7. The generated value is an `http.RequestListener` can be passed to `http.createServer()` to initialize your server.

```
const server = http.createServer(app);
server.listen(3000);
```

## Utilities

- `function read(r: http.IncomingMessage, options?: { maxBytes: number; }): Promise<Buffer>;`

Example:

```
const handlerPOST: Handler = async function (r, w, ctx) {
  const bodyBuffer = await read(r);
  const bodyJSON = JSON.parse(bodyBuffer.toString());
  w.end();
}
```

## API Reference

`interface Ctx {}`

`type Handler = (r: http.IncomingMessage, w: http.ServerResponse, ctx: Ctx) => Promise<void>;`

`type Handlers = { [path: string]: Handler; };`

`type Middleware = (next: Handler) => Promise<Handler>;`

`function App(mux: Handler): http.RequestListener;`

`function Mux(handlers: Handlers, _404: Handler): Handler;`

`function read(r: http.IncomingMessage, options?: { maxBytes: number; }): Promise<Buffer>;`
