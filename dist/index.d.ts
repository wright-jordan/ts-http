/// <reference types="node" />
import { IncomingMessage, ServerResponse, RequestListener } from "http";
import { Cluster } from "cluster";
export interface Context {
    status?: number;
    reply?: Buffer | Uint8Array | string;
    cookies: string[];
    r: IncomingMessage;
    w: ServerResponse;
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
/**
 * Returns a router {@link Handler} that can be passed to {@link makeListener}. Can optionally be wrapped with middleware.
 * @throws `never`
 */
export declare function makeRouter(handlers: Handlers): Handler;
/**
 * Accepts a router, router wrapped with middleware, or any {@link Handler}, and returns an {@link http.RequestListener}.
 * @throws `never`
 */
export declare function makeListener(router: Handler): RequestListener;
export declare function listenHTTP(listener: RequestListener, port: number, threadCount: number, fn?: (cluster: Cluster) => void, listenerCallback?: () => void): void;
export declare class PayloadTooLargeError extends Error {
    constructor();
}
/**
 * Reads the request body.
 * @throws {@link PayloadTooLargeError}
 * @throws `unknown`
 */
export declare function read(ctx: Context, options?: {
    maxBytes: number;
}): Promise<Buffer>;
