const http = require('http');
const url = require('url');

class Syvex {
  constructor() {
    this.routes = [];
  }

  get(path, handler) {
    this.addRoute('GET', path, handler);
  }

  post(path, handler) {
    this.addRoute('POST', path, handler);
  }

  put(path, handler) {
    this.addRoute('PUT', path, handler);
  }

  delete(path, handler) {
    this.addRoute('DELETE', path, handler);
  }

  addRoute(method, path, handler) {
    const parsedPath = path.replace(/:[^/]+/g, '([^/]+)');
    const paramNames = (path.match(/:[^/]+/g) || []).map((param) =>
      param.slice(1)
    );
    this.routes.push({ method, path: parsedPath, handler, paramNames });
  }

  handleRequest(req, res) {
    const parsedUrl = url.parse(req.url, true);
    const route = this.findRoute(req.method, parsedUrl.pathname);

    if (route) {
      req.query = parsedUrl.query;
      req.params = this.extractRouteParams(
        route.path,
        parsedUrl.pathname,
        route.paramNames
      );
      route.handler(req, res);
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
    }
  }

  extractRouteParams(routePath, pathname, paramNames) {
    const paramValues = pathname.match(new RegExp(routePath));

    const params = {};
    if (paramValues) {
      paramValues.shift(); // Remove the full match
      paramValues.forEach((value, index) => {
        params[paramNames[index]] = value;
      });
    }
    return params;
  }

  listen(port, callback) {
    const server = http.createServer((req, res) => {
      this.handleRequest(req, res);
    });

    server.listen(port, callback);
  }

  findRoute(method, path) {
    const route = this.routes.find(
      (route) =>
        (route.method === method || route.method === 'ANY') &&
        this.matchPath(route.path, path)
    );
    return route;
  }

  matchPath(pattern, path) {
    const regex = new RegExp(`^${pattern}$`);
    return regex.test(path);
  }
}

module.exports = Syvex;
