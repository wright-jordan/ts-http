import * as http from "node:http";

type Context = {} | null;

export type ListenerWithContext<C extends Context> = {
  (req: http.IncomingMessage, res: http.ServerResponse, ctx: C): Promise<void>;
};

export function NewTestRouteListener<C extends Context>(
  ctx: C,
  ctxListener: ListenerWithContext<C>
): http.RequestListener {
  return (req, res) => {
    ctxListener(req, res, ctx);
  };
}

export function NewTestMiddlewareListener<C extends Context>(
  ctx: C,
  middleware: Middleware<C>,
  ctxListener: ListenerWithContext<C>
): http.RequestListener {
  return (req, res) => {
    middleware.use(ctxListener)(req, res, ctx);
  };
}

export function NewAppListener(
  routes: Map<string, http.RequestListener>,
  fallback: http.RequestListener
): http.RequestListener {
  return async (req, res) => {
    (routes.get(req.url!.split("?", 1)[0]!) || fallback)(req, res);
  };
}

export type Middleware<C extends Context> = {
  use(
    this: Middleware<C>,
    next: ListenerWithContext<any>
  ): ListenerWithContext<C>;
};
