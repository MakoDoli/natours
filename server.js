/* eslint-disable prefer-template */
// eslint-disable-next-line import/no-extraneous-dependencies
const mongoose = require('mongoose');

const dotenv = require('dotenv');

process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION! Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

dotenv.config();
const app = require('./app');

// .connect(process.env.DATABASE_LOCAL, {}) if database is running in local terminal

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD,
);
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => {
    console.log(`CONNECTION  SUCCESSFUL✅`);
  });

// Load environment variables from.env file

console.log(process.env.NODE_ENV);

const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});

process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message);
  console.log('Unhandled Rejection happened! Shutting down...');
  server.close(() => {
    process.exit(1);
  });
});

// PREVENT app from abrupt heroku shutdown in every 24h
// server.close() enables all ongoing requests to finish before shutting down

process.on('SIGTERM', () => {
  console.log('Sigterm received. Shut down gracefully');
  server.close(() => {
    console.log('Process terminated!');
  });
  process.exit(1);
});
