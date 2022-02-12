import http from "http";
import cookie from "cookie";

export { cookie };

export interface Ctx {}

export type Handler = (
  r: http.IncomingMessage,
  w: http.ServerResponse,
  ctx: Ctx
) => Promise<void>;

export type Handlers = {
  [path: string]: Handler;
};

export type Middleware = (next: Handler) => Promise<Handler>;

export function App(mux: Handler): http.RequestListener {
  return async function (r, w) {
    const ctx: Ctx = {};
    await mux(r, w, ctx);
  };
}

export function Mux(handlers: Handlers, _404: Handler): Handler {
  return async function mux(r, w, ctx) {
    const path = r.url;
    if (typeof path === "undefined") {
      await _404(r, w, ctx);
      return;
    }
    const handler = handlers[path];
    if (typeof handler === "undefined") {
      await _404(r, w, ctx);
      return;
    }
    await handler(r, w, ctx);
  };
}

class PayloadTooLargeError extends Error {
  constructor() {
    super(http.STATUS_CODES[413]);
  }
}

export async function read(
  r: http.IncomingMessage,
  options: { maxBytes: number } = { maxBytes: 16384 }
): Promise<Buffer> {
  const buf: Buffer[] = [];
  let byteCount = 0;
  return new Promise((resolve, reject) => {
    r.on("error", reject);
    r.on("data", (chunk: Buffer) => {
      byteCount += chunk.byteLength;
      if (byteCount > options.maxBytes) {
        r.destroy(new PayloadTooLargeError());
        return;
      }
      buf.push(chunk);
    });
    r.on("end", () => {
      resolve(Buffer.concat(buf));
    });
  });
}
