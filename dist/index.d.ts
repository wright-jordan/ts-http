/// <reference types="node" />
import http from "http";
export interface Ctx {
}
export declare type Handler = (r: http.IncomingMessage, w: http.ServerResponse, ctx: Ctx) => Promise<void>;
export declare type Handlers = {
    [path: string]: Handler;
};
export declare type Middleware = (next: Handler) => Promise<Handler>;
export declare function App(mux: Handler): http.RequestListener;
export declare function Mux(handlers: Handlers, _404: Handler): Handler;
export declare function read(r: http.IncomingMessage, options?: {
    maxBytes: number;
}): Promise<Buffer>;
