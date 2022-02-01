/// <reference types="node" />
import { IncomingMessage, ServerResponse } from "http";
export declare type AsyncRequestListener = (req: IncomingMessage, res: ServerResponse) => Promise<void>;
export declare type Handlers = {
    [path: string]: AsyncRequestListener;
};
export declare type Middleware = (next: AsyncRequestListener) => Promise<AsyncRequestListener>;
export default function Mux(handlers: Handlers, _404: AsyncRequestListener): AsyncRequestListener;
export declare function readBuf(req: IncomingMessage, options?: {
    maxBytes: number;
}): Promise<Buffer>;
export declare function readStr(req: IncomingMessage, options?: {
    encoding: BufferEncoding;
    maxChunks: number;
}): Promise<string>;
