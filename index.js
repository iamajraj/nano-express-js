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
    res.status(200).send(req.greet);
  }
);

app.post('/giveme/:id', (req, res) => {
  res.status(200).json({
    id: Number(req.params.id),
    ...req.body,
  });
});

// Handle dynamic route parameter :id
app.get('/api/data/:id/:name', (req, res) => {
  res
    .status(200)
    .send(`Requested resource ID: ${req.params.id}, ${req.params.name}`);
});

app.listen(3000, () => {
  console.log('Server is listening on port 3000');
});
