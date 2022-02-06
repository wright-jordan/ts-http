import { Mux, App } from "mux";
import http from "http";
const _404 = async function (r, w, ctx) {
    w.statusCode = 404;
    w.write(JSON.stringify({ message: http.STATUS_CODES[404] }));
};
const handler = async function (r, w, ctx) {
    console.log(ctx);
    w.write(JSON.stringify({ hello: "world" }));
};
const handlers = {
    "/": handler,
};
const mw = async function (next) {
    return async function (r, w, ctx) {
        ctx.data = "ctx.data";
        await next(r, w, ctx);
    };
};
const mux = Mux(handlers, _404);
const app = App(await mw(mux));
const server = http.createServer(app);
server.listen(3000);
