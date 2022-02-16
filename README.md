# ts-http

A small collection of functions and types that provide a simple routing mechanism and middleware pattern.

## API

### Types

```
interface Context {
    status?: number;
    reply?: Buffer | Uint8Array | string;
    cookies: string[];
    r: http.IncomingMessage;
    w: http.ServerResponse;
}
```

```
interface Handler {
    (ctx: Context): Promise<void>;
}
```

```
interface Handlers {
    [path: string]: Handler;
    "404": Handler;
}
```

```
interface Middleware {
    (next: Handler): Handler;
}
```

### Functions

```
function makeRouter(handlers: Handlers): Handler;
```

```
function makeListener(app: Handler): http.RequestListener;
```

```
function read(ctx: Context, options?: { maxBytes: number; }): Promise<Buffer>;
```

### Errors

```
class PayloadTooLargeError extends Error {
    constructor();
}
```
