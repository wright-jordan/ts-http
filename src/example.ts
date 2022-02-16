import {
  Handler,
  Handlers,
  makeRouter,
  makeListener,
  Middleware,
  PayloadTooLargeError,
  read,
} from "ts-http";
import http from "http";

declare module "ts-http" {
  interface Context {
    msg: string;
  }
}

const echo: Handler = async function echo(ctx) {
  try {
    const buf = await read(ctx);
    const body: Record<string, unknown> = JSON.parse(buf.toString());
    ctx.reply = JSON.stringify(body);
  } catch (error) {
    if (error instanceof PayloadTooLargeError) {
      return;
    }
    ctx.status = 400;
  }
};

const handlers: Handlers = {
  "/echo": echo,
  async ["404"](ctx) {
    ctx.status = 404;
  },
};

const useMiddleware: Middleware = function useMiddleware(next) {
  return async function middleware(ctx) {
    ctx.msg = "hello world";
    ctx.cookies.push("cookie1=value1");
    await next(ctx);
    ctx.cookies.push("cookie4=value4");
  };
};

const useAnotherMiddleware: Middleware = function useAnotherMiddleware(next) {
  return async function anotherMiddleware(ctx) {
    ctx.cookies.push("cookie2=value2");
    await next(ctx);
    ctx.cookies.push("cookie3=value3");
    console.log(ctx.msg);
  };
};

const router = makeRouter(handlers);
const app = useMiddleware(useAnotherMiddleware(router));
const listener = makeListener(app);

http.createServer(listener).listen(8080);
