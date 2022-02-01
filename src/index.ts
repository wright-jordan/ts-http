import http, { IncomingMessage, ServerResponse } from "http";

export type AsyncRequestListener = (
  req: IncomingMessage,
  res: ServerResponse
) => Promise<void>;

export type Handlers = {
  [path: string]: AsyncRequestListener;
};

export type Middleware = (
  next: AsyncRequestListener
) => Promise<AsyncRequestListener>;

export default function Mux(
  handlers: Handlers,
  _404: AsyncRequestListener
): AsyncRequestListener {
  return async function mux(req: IncomingMessage, res: ServerResponse) {
    const path = req.url;
    if (typeof path === "undefined") {
      await _404(req, res);
      return;
    }
    const handler = handlers[path];
    if (typeof handler === "undefined") {
      await _404(req, res);
      return;
    }
    await handler(req, res);
  };
}

class PayloadTooLargeError extends Error {
  constructor() {
    super(http.STATUS_CODES[413]);
  }
}

export async function readBuf(
  req: IncomingMessage,
  options: { maxBytes: number } = { maxBytes: 16384 }
): Promise<Buffer> {
  const buf: Buffer[] = [];
  let byteCount = 0;
  return new Promise((resolve, reject) => {
    req.on("error", (err) => {
      reject(err);
      return;
    });
    req.on("data", (chunk: Buffer) => {
      byteCount += chunk.byteLength;
      if (byteCount > options.maxBytes) {
        req.destroy(new PayloadTooLargeError());
        return;
      }
      buf.push(chunk);
    });
    req.on("end", () => {
      resolve(Buffer.concat(buf));
      return;
    });
  });
}

export async function readStr(
  req: IncomingMessage,
  options: { encoding: BufferEncoding; maxChunks: number } = {
    encoding: "utf-8",
    maxChunks: 1,
  }
): Promise<string> {
  let str = "";
  let chunkCount = 0;
  return new Promise((resolve, reject) => {
    req.setEncoding(options.encoding);
    req.on("error", (err) => {
      reject(err);
      return;
    });
    req.on("data", (chunk: string) => {
      chunkCount += 1;
      if (chunkCount > options.maxChunks) {
        req.destroy(new PayloadTooLargeError());
        return;
      }
      str += chunk;
    });
    req.on("end", () => {
      resolve(str);
      return;
    });
  });
}
