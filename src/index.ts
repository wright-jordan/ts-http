import {
  IncomingMessage,
  ServerResponse,
  RequestListener,
  createServer,
} from "http";
import cluster, { Cluster } from "cluster";
import { cpus } from "os";

export interface Context {
  status?: number;
  reply?: Buffer | Uint8Array | string;
  cookies: string[];
  r: IncomingMessage;
  w: ServerResponse;
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
export function makeListener(router: Handler): RequestListener {
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

/**
 * Starts server. Uses {@link cluster} module to create separate processes if `threadCount > 1`. Default `threadCount` is number of cpus.
 */
export function listenHTTP(
  listener: RequestListener,
  port: bigint = 8080n,
  threadCount: bigint = BigInt(cpus().length),
  fn: (cluster: Cluster) => void = (cluster) => {
    cluster.on("exit", (worker) => {
      console.log(`worker ${worker.process.pid} died`);
    });
  },
  listenerCallback: () => void = () => {
    if (threadCount > 1n) {
      `worker ${process.pid} started`;
      return;
    }
  }
) {
  if (threadCount === 1n) {
    createServer(listener).listen(port, listenerCallback);
    return;
  }

  if (cluster.isPrimary) {
    for (let i = 0; i < threadCount; i++) {
      cluster.fork();
    }
    fn(cluster);
  } else {
    createServer(listener).listen(Number(port), listenerCallback);
  }
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
