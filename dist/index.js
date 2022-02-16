export function makeRouter(handlers) {
    return async function router(ctx) {
        await (handlers[ctx.r.url] || handlers["404"])(ctx);
    };
}
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
export class PayloadTooLargeError extends Error {
    constructor() {
        super();
    }
}
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
