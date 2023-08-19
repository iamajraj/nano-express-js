const http = require('http');
const url = require('url');

class NanoExpress {
  constructor() {
    this.routes = [];
  }

  get(path, handler) {
    this.routes.push({ method: 'GET', path, handler });
  }

  listen(port, callback) {
    const server = http.createServer((req, res) => {
      const parsedUrl = url.parse(req.url, true);
      const route = this.findRoute(req.method, parsedUrl.pathname);

      if (route) {
        req.query = parsedUrl.query;
        route.handler(req, res);
      } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
      }
    });

    server.listen(port, callback);
  }

  findRoute(method, path) {
    return this.routes.find(
      (route) => route.method === method && route.path === path
    );
  }
}

module.exports = NanoExpress;
