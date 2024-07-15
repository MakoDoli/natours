/* eslint-disable prefer-template */
const dotenv = require('dotenv');

dotenv.config();
const app = require('./app');
// Load environment variables from.env file

console.log(process.env.NODE_ENV);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log('listening on port ' + port);
});
