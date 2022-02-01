// @ts-nocheck

import { Handlers, Handler, Mux, Middleware, App } from "mux";
import http from "http";

declare module "mux" {
  interface Ctx {
    data?: string;
  }
}

const _404: Handler = async function (r, w, ctx) {
  w.statusCode = 404;
  w.end(JSON.stringify({ message: http.STATUS_CODES[404] }));
};

const handler: Handler = async function (r, w, ctx) {
  console.log(ctx);
  w.end(JSON.stringify({ hello: "world" }));
};

const handlers: Handlers = {
  "/": handler,
};

const mw: Middleware = async function (next) {
  return async function (r, w, ctx) {
    ctx.data = "ctx.data";
    await next(r, w, ctx);
  };
};

const mux = Mux(handlers, _404);
const app = App(await mw(mux));

const server = http.createServer(app);
server.listen(3000);
