const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'https://mentorhub-backend-five.vercel.app',
      changeOrigin: true,
      secure: false,
      headers: {
        Connection: 'keep-alive'
      },
      onError: (err, req, res) => {
        console.error('Proxy Error:', err);
        res.status(500).send('Proxy Error');
      }
    })
  );
}; 