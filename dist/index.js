import http from "http";
import { parse, serialize } from "cookie";
import { StatusCodes } from "http-status-codes";
export const cookie = { parse, serialize };
export { StatusCodes };
export function App(mux) {
    return async function (r, w) {
        const ctx = {};
        await mux(r, w, ctx);
    };
}
export function Mux(handlers, _404) {
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
export async function read(r, options = { maxBytes: 16384 }) {
    const buf = [];
    let byteCount = 0;
    return new Promise((resolve, reject) => {
        r.on("error", reject);
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
        });
    });
}
