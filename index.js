const NanoExpress = require('./package/src/nanoexpress');
const app = new NanoExpress();

app.get('/', (req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Hello, World!');
});

// Handle dynamic route parameter :id
app.get('/api/data/:id', (req, res) => {
  const resourceId = req.params.id;
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end(`Requested resource ID: ${resourceId}`);
});

app.listen(3000, () => {
  console.log('Server is listening on port 3000');
});
