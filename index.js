const NanoExpress = require('./package/src/nanoexpress');
const app = new NanoExpress();

app.get('/', (req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Hello, World!');
});

app.get('/api/data', (req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  const data = { message: 'This is some data from the API.' };
  res.end(JSON.stringify(data));
});

app.listen(3000, () => {
  console.log('Server is listening on port 3000');
});
