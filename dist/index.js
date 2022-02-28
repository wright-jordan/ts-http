import { createServer, } from "http";
import { cpus } from "os";
import cluster from "cluster";
/**
 * Returns a router {@link Handler} that can be passed to {@link makeListener}. Can optionally be wrapped with middleware.
 * @throws `never`
 */
export function makeRouter(handlers) {
    return async function router(ctx) {
        await (handlers[ctx.r.url] || handlers["404"])(ctx);
    };
}
/**
 * Accepts a router, router wrapped with middleware, or any {@link Handler}, and returns an {@link http.RequestListener}.
 * @throws `never`
 */
export function makeListener(router) {
    return async function listener(r, w) {
        const ctx = { r, w, cookies: [] };
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
export function listen(listener, port, fn) {
    if (cluster.isPrimary) {
        const numCpus = cpus().length;
        for (let i = 0; i < numCpus; i++) {
            cluster.fork();
        }
        fn(cluster);
    }
    else {
        createServer(listener).listen(port);
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
export async function read(ctx, options = { maxBytes: 16384 }) {
    const buf = [];
    let byteCount = 0;
    return new Promise((resolve, reject) => {
        ctx.r.on("error", reject);
        ctx.r.on("data", (chunk) => {
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
