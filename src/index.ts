import http from "http";

export interface Context {
  status?: number;
  reply?: Buffer | Uint8Array | string;
  cookies: string[];
  r: http.IncomingMessage;
  w: http.ServerResponse;
}

export interface Handler {
  (ctx: Context): Promise<void>;
}

export interface Handlers {
  [path: string]: Handler;
  "404": Handler;
}

export interface Middleware {
  (next: Handler): Handler;
}

/**
 * Returns a router {@link Handler} that can be passed to {@link makeListener}. Can optionally be wrapped with middleware.
 * @throws `never`
 */
export function makeRouter(handlers: Handlers): Handler {
  return async function router(ctx) {
    await (handlers[ctx.r.url!] || handlers["404"])(ctx);
  };
}

/**
 * Accepts a router, router wrapped with middleware, or any {@link Handler}, and returns an {@link http.RequestListener}.
 * @throws `never`
 */
export function makeListener(router: Handler): http.RequestListener {
  return async function listener(r, w) {
    const ctx: Context = { r, w, cookies: [] };

    await router(ctx);

    if (w.headersSent) {
      return;
    }
    if (ctx.cookies.length > 0) {
      w.setHeader("Set-Cookie", ctx.cookies);
    }
    w.statusCode = ctx.status || 200;
    w.end(ctx.reply);
  };
}

export class PayloadTooLargeError extends Error {
  constructor() {
    super();
  }
}

/**
 * Reads the request body.
 * @throws {@link PayloadTooLargeError}
 * @throws `unknown`
 */
export async function read(
  ctx: Context,
  options: { maxBytes: number } = { maxBytes: 16384 }
): Promise<Buffer> {
  const buf: Buffer[] = [];
  let byteCount = 0;
  return new Promise((resolve, reject) => {
    ctx.r.on("error", reject);
    ctx.r.on("data", (chunk: Buffer) => {
      byteCount += chunk.byteLength;
      if (byteCount > options.maxBytes) {
        ctx.w.statusCode = 413;
        ctx.w.end();
        ctx.r.destroy(new PayloadTooLargeError());
        return;
      }
      buf.push(chunk);
    });
    ctx.r.on("end", () => {
      resolve(Buffer.concat(buf));
    });
  });
}
