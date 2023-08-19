const http = require('http');
const url = require('url');

/**
 * Syvex - A simple HTTP server with routing capabilities.
 */
class Syvex {
  /** @type {Array<{ method: string, path: string, handler: function, paramNames: string[] }>} */
  #routes = [];

  /**
   * Define a GET route.
   * @param {string} path - The route path.
   * @param {function} handler - The route handler function.
   */
  get(path, handler) {
    this.#addRoute('GET', path, handler);
  }

  /**
   * Define a POST route.
   * @param {string} path - The route path.
   * @param {function} handler - The route handler function.
   */
  post(path, handler) {
    this.#addRoute('POST', path, handler);
  }

  /**
   * Define a PUT route.
   * @param {string} path - The route path.
   * @param {function} handler - The route handler function.
   */
  put(path, handler) {
    this.#addRoute('PUT', path, handler);
  }

  /**
   * Define a DELETE route.
   * @param {string} path - The route path.
   * @param {function} handler - The route handler function.
   */
  delete(path, handler) {
    this.#addRoute('DELETE', path, handler);
  }

  /**
   * Add a route to the router.
   * @param {string} method - The HTTP method.
   * @param {string} path - The route path.
   * @param {function} handler - The route handler function.
   */
  #addRoute(method, path, handler) {
    const parsedPath = path.replace(/:[^/]+/g, '([^/]+)');
    const paramNames = (path.match(/:[^/]+/g) || []).map((param) =>
      param.slice(1)
    );
    this.#routes.push({ method, path: parsedPath, handler, paramNames });
  }

  /**
   * Handle incoming HTTP requests.
   * @param {http.IncomingMessage} req - The incoming request object.
   * @param {http.ServerResponse} res - The response object.
   */
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
      route.handler(req, res);
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
    }
  }

  /**
   * Extract route parameters from the URL.
   * @param {string} routePath - The route path pattern.
   * @param {string} pathname - The actual URL pathname.
   * @param {string[]} paramNames - Names of dynamic route parameters.
   * @returns {Object} An object containing the route parameters.
   */
  #extractRouteParams(routePath, pathname, paramNames) {
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

  /**
   * Start the HTTP server and listen on the specified port.
   * @param {number} port - The port to listen on.
   * @param {function} callback - The callback function to execute when the server starts.
   */
  listen(port, callback) {
    const server = http.createServer((req, res) => {
      this.#handleRequest(req, res);
    });

    server.listen(port, callback);
  }

  /**
   * Find a matching route for the incoming request.
   * @param {string} method - The HTTP method of the request.
   * @param {string} path - The URL path of the request.
   * @returns {Object|null} The matched route or null if no match is found.
   */
  #findRoute(method, path) {
    const route = this.#routes.find(
      (route) =>
        (route.method === method || route.method === 'ANY') &&
        this.#matchPath(route.path, path)
    );
    return route;
  }

  /**
   * Check if the given path matches the route pattern.
   * @param {string} pattern - The route pattern.
   * @param {string} path - The path to check.
   * @returns {boolean} True if the path matches the pattern, false otherwise.
   */
  #matchPath(pattern, path) {
    const regex = new RegExp(`^${pattern}$`);
    return regex.test(path);
  }
}

module.exports = Syvex;
