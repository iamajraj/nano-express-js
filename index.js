const syvex = require('./package/src/syvex');
const app = new syvex();

app.use(syvex.json());

app.get(
  '/',
  (req, _, next) => {
    req.greet = 'Hello World!';
    next();
  },
  (req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end(req.greet);
  }
);

app.post('/giveme', (req, res) => {
  console.log(req.body);

  res.end(JSON.stringify(req.body));
});

// Handle dynamic route parameter :id
app.get('/api/data/:id/:name', (req, res) => {
  const resourceId = req.params.id;
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end(`Requested resource ID: ${resourceId}, ${req.params.name}`);
});

app.listen(3000, () => {
  console.log('Server is listening on port 3000');
});
