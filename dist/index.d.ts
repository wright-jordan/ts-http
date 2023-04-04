/// <reference types="node" />
import * as http from "node:http";
type Context = {} | null;
export type ListenerWithContext<C extends Context> = {
    (req: http.IncomingMessage, res: http.ServerResponse, ctx: C): Promise<void>;
};
export declare function NewTestRouteListener<C extends Context>(ctx: C, ctxListener: ListenerWithContext<C>): http.RequestListener;
export declare function NewTestMiddlewareListener<C extends Context>(ctx: C, middleware: Middleware<C>, ctxListener: ListenerWithContext<C>): http.RequestListener;
export declare function NewAppListener(routes: Map<string, http.RequestListener>, fallback: http.RequestListener): http.RequestListener;
export type Middleware<C extends Context> = {
    use(this: Middleware<C>, next: ListenerWithContext<any>): ListenerWithContext<C>;
};
export {};
