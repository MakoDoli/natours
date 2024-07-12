const express = require('express');

const app = express();

app.get('/', (_, res) => {
  res.status(200).json({ message: 'Hello from Server World!', app: 'natours' });
});

app.post('/', (_, res) => {
  res.send('You can post to this endpoint');
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log('listening on port ' + port);
});
