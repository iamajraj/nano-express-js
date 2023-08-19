const http = require('http');
const url = require('url');

class Syvex {
  #routes = [];
  #globalMiddlewares = [];

  get(path, ...handlers) {
    this.#addRoute('GET', path, handlers);
  }

  post(path, ...handlers) {
    this.#addRoute('POST', path, handlers);
  }

  put(path, ...handlers) {
    this.#addRoute('PUT', path, handlers);
  }

  delete(path, ...handlers) {
    this.#addRoute('DELETE', path, handlers);
  }

  use(middleware) {
    this.#globalMiddlewares.push(middleware);
  }

  #addRoute(method, path, handlers) {
    const parsedPath = path.replace(/:[^/]+/g, '([^/]+)');
    const paramNames = (path.match(/:[^/]+/g) || []).map((param) =>
      param.slice(1)
    );
    this.#routes.push({ method, path: parsedPath, handlers, paramNames });
  }

  #handleRequest(req, res) {
    const parsedUrl = url.parse(req.url, true);
    const route = this.#findRoute(req.method, parsedUrl.pathname);

    if (route) {
      req.query = parsedUrl.query;
      req.params = this.#extractRouteParams(
        route.path,
        parsedUrl.pathname,
        route.paramNames
      );

      const middlewares = [...this.#globalMiddlewares, ...route.handlers];

      const next = () => {
        const middleware = middlewares.shift();
        if (middleware) {
          middleware(req, res, next);
        }
      };

      next();
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
    }
  }

  #extractRouteParams(routePath, pathname, paramNames) {
    const paramValues = pathname.match(new RegExp(routePath));
    const params = {};
    if (paramValues) {
      paramValues.shift();
      paramValues.forEach((value, index) => {
        params[paramNames[index]] = value;
      });
    }
    return params;
  }

  listen(port, callback) {
    const server = http.createServer((req, res) => {
      this.#handleRequest(req, res);
    });

    server.listen(port, callback);
  }

  #findRoute(method, path) {
    const route = this.#routes.find(
      (route) =>
        (route.method === method || route.method === 'ANY') &&
        this.#matchPath(route.path, path)
    );
    return route;
  }

  #matchPath(pattern, path) {
    const regex = new RegExp(`^${pattern}$`);
    return regex.test(path);
  }
}

module.exports = Syvex;
