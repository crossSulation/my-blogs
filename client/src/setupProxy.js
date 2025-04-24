const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/gridfs', // 匹配以 /api 开头的请求路径
    createProxyMiddleware({
      target: 'http://localhost:9099',
      changeOrigin: true, // 允许跨域请求  
    })
  );
  app.use(
    '^/predict', // 匹配以 /predict 开头的请求路径
    createProxyMiddleware({
      target: 'http://127.0.0.1:5000',
      changeOrigin: true, // 允许跨域请求
    })
  )
}