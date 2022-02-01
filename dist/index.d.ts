/// <reference types="node" />
import http from "http";
interface Ctx {
}
export declare type Handler = (r: http.IncomingMessage, w: http.ServerResponse) => Promise<void>;
export declare type HandlerCtx = (r: http.IncomingMessage, w: http.ServerResponse, ctx: Ctx) => Promise<void>;
export declare type Handlers = {
    [path: string]: Handler;
};
export declare type HandlersCtx = {
    [path: string]: HandlerCtx;
};
export declare function useCtx(next: HandlerCtx): http.RequestListener;
export declare type Middleware = (next: Handler) => Promise<Handler>;
export declare type MiddlewareCtx = (next: HandlerCtx) => Promise<HandlerCtx>;
export declare function Mux(handlers: Handlers, _404: Handler): Handler;
export declare function MuxCtx(handlersCtx: HandlersCtx, _404: HandlerCtx): HandlerCtx;
export declare function readBuf(r: http.IncomingMessage, options?: {
    maxBytes: number;
}): Promise<Buffer>;
export declare function readStr(r: http.IncomingMessage, options?: {
    encoding: BufferEncoding;
    maxChunks: number;
}): Promise<string>;
export {};
