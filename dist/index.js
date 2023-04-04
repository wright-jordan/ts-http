export function NewTestRouteListener(ctx, ctxListener) {
    return (req, res) => {
        ctxListener(req, res, ctx);
    };
}
export function NewTestMiddlewareListener(ctx, middleware, ctxListener) {
    return (req, res) => {
        middleware.use(ctxListener)(req, res, ctx);
    };
}
export function NewAppListener(routes, fallback) {
    return async (req, res) => {
        (routes.get(req.url.split("?", 1)[0]) || fallback)(req, res);
    };
}
