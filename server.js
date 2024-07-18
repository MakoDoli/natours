/* eslint-disable prefer-template */
// eslint-disable-next-line import/no-extraneous-dependencies
const mongoose = require('mongoose');

const dotenv = require('dotenv');

dotenv.config();
const app = require('./app');

// .connect(process.env.DATABASE_LOCAL, {}) if database is running in local terminal
mongoose
  .connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then((con) => {
    console.log(con.connections.name);
    console.log('CONNECTION SUCCESSFUL✅');
  });

// Load environment variables from.env file

console.log(process.env.NODE_ENV);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log('listening on port ' + port);
});
