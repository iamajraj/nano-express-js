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

  #handleRequest(_req, _res) {
    const parsedUrl = url.parse(_req.url, true);
    const route = this.#findRoute(_req.method, parsedUrl.pathname);

    // custom response object
    const res = new Response(_res);

    if (route) {
      const middlewares = [...this.#globalMiddlewares, ...route.handlers];

      // custom request object
      const req = new Request(_req, route);

      const next = () => {
        const middleware = middlewares.shift();
        if (middleware) {
          middleware(req, res, next);
        }
      };

      next();
    } else {
      res.status(400).send('Not found');
    }
  }

  listen(port, callback) {
    const server = http.createServer((_req, _res) => {
      this.#handleRequest(_req, _res);
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

  static json(options) {
    return (req, res, next) => {
      let body = '';
      req.on('data', (chunk) => {
        body += chunk.toString();
      });

      req.on('end', () => {
        if (body) {
          try {
            req.body = JSON.parse(body);
          } catch (error) {}
        }
        next();
      });
    };
  }
}

class Request {
  url;
  method;
  req;
  params;
  query;
  #route;
  constructor(req, route) {
    this.url = req.url;
    this.method = req.method;
    this.req = req;
    this.#route = route;

    const parsedURL = url.parse(this.url, true);

    this.query = parsedURL.query;
    this.params = this.#extractRouteParams(
      this.#route.path,
      parsedURL.pathname,
      this.#route.paramNames
    );
  }
  on(event, callback) {
    this.req.on(event, callback);
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
}

class Response {
  #res;
  constructor(res) {
    this.#res = res;
    this.#res.setHeader('Content-Type', 'text/plain');
  }
  status(statusCode) {
    this.#res.statusCode = statusCode;
    return this;
  }
  send(data) {
    this.#res.end(data);
    return this;
  }

  json(data) {
    this.#res.setHeader('Content-Type', 'application/json');
    this.#res.end(JSON.stringify(data));
  }
}

module.exports = Syvex;
