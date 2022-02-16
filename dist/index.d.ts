/// <reference types="node" />
import http from "http";
export interface Context {
    status?: number;
    reply?: Buffer | Uint8Array | string;
    cookies: string[];
    r: http.IncomingMessage;
    w: http.ServerResponse;
}
export interface Handler {
    (ctx: Context): Promise<void>;
}
export interface Handlers {
    [path: string]: Handler;
    "404": Handler;
}
export interface Middleware {
    (next: Handler): Handler;
}
export declare function makeRouter(handlers: Handlers): Handler;
export declare function makeListener(router: Handler): http.RequestListener;
export declare class PayloadTooLargeError extends Error {
    constructor();
}
export declare function read(ctx: Context, options?: {
    maxBytes: number;
}): Promise<Buffer>;
