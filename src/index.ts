import http from "http";
import { ReasonPhrases } from "http-status-codes";

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

export function App(next: Handler): http.RequestListener {
  return async function (r, w) {
    const ctx: Ctx = {};
    await next(r, w, ctx);
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
    super(ReasonPhrases.REQUEST_TOO_LONG);
  }
}

export async function read(
  r: http.IncomingMessage,
  options: { maxBytes: number } = { maxBytes: 16384 }
): Promise<Buffer> {
  const buf: Buffer[] = [];
  let byteCount = 0;
  return new Promise((resolve, reject) => {
    r.on("error", (err) => {
      reject(err);
      return;
    });
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
      return;
    });
  });
}
