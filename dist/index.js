import http from "http";
export function useCtx(next) {
    return function (r, w) {
        const ctx = {};
        next(r, w, ctx);
    };
}
export function Mux(handlersCtx, _404) {
    return async function muxCtx(r, w, ctx) {
        const path = r.url;
        if (typeof path === "undefined") {
            await _404(r, w, ctx);
            return;
        }
        const handlerCtx = handlersCtx[path];
        if (typeof handlerCtx === "undefined") {
            await _404(r, w, ctx);
            return;
        }
        await handlerCtx(r, w, ctx);
    };
}
class PayloadTooLargeError extends Error {
    constructor() {
        super(http.STATUS_CODES[413]);
    }
}
export async function readBuf(r, options = { maxBytes: 16384 }) {
    const buf = [];
    let byteCount = 0;
    return new Promise((resolve, reject) => {
        r.on("error", (err) => {
            reject(err);
            return;
        });
        r.on("data", (chunk) => {
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
export async function readStr(r, options = {
    encoding: "utf-8",
    maxChunks: 1,
}) {
    let str = "";
    let chunkCount = 0;
    return new Promise((resolve, reject) => {
        r.setEncoding(options.encoding);
        r.on("error", (err) => {
            reject(err);
            return;
        });
        r.on("data", (chunk) => {
            chunkCount += 1;
            if (chunkCount > options.maxChunks) {
                r.destroy(new PayloadTooLargeError());
                return;
            }
            str += chunk;
        });
        r.on("end", () => {
            resolve(str);
            return;
        });
    });
}
