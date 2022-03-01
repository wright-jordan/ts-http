import {
  Handler,
  Handlers,
  makeRouter,
  makeListener,
  Middleware,
  PayloadTooLargeError,
  read,
  listenHTTP,
} from "ts-http";
import { cpus } from "os";

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
    ctx.cookies.push("name=value");
    console.log("runs first");
    await next(ctx);
    console.log("runs fourth");
  };
};

const useAnotherMiddleware: Middleware = function useAnotherMiddleware(next) {
  return async function anotherMiddleware(ctx) {
    console.log("runs second");
    await next(ctx);
    console.log("runds third");
    console.log(ctx.msg);
  };
};

const router = makeRouter(handlers);
const wrappedRouter = useMiddleware(useAnotherMiddleware(router));
const listener = makeListener(wrappedRouter);

listenHTTP(
  listener,
  8080,
  cpus().length,
  (cluster) => {
    cluster.on("exit", (worker) => {
      console.log(`worker ${worker.process.pid} died`);
    });
  },
  () => {
    `worker ${process.pid} started`;
  }
);
