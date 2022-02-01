import http from "http";
export default function Mux(handlers, _404) {
    return async function mux(req, res) {
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
export async function readBuf(req, options = { maxBytes: 16384 }) {
    const buf = [];
    let byteCount = 0;
    return new Promise((resolve, reject) => {
        req.on("error", (err) => {
            reject(err);
            return;
        });
        req.on("data", (chunk) => {
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
export async function readStr(req, options = {
    encoding: "utf-8",
    maxChunks: 1,
}) {
    let str = "";
    let chunkCount = 0;
    return new Promise((resolve, reject) => {
        req.setEncoding(options.encoding);
        req.on("error", (err) => {
            reject(err);
            return;
        });
        req.on("data", (chunk) => {
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
