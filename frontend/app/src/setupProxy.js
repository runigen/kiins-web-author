const { createProxyMiddleware } = require('http-proxy-middleware');

const apiServerUrl = process.env.REACT_APP_SERVER_URL;
module.exports = function (app) {
    app.use(
        '/api',
        createProxyMiddleware({
            target: apiServerUrl,
            changeOrigin: true,
        }),
    );
    app.use(
        '/docs',
        createProxyMiddleware({
            target: apiServerUrl,
            changeOrigin: true,
        }),
    );
    app.use(
        '/viewer',
        createProxyMiddleware({
            target: apiServerUrl,
            changeOrigin: true,
        }),
    );
};
