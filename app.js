/* eslint-disable import/no-extraneous-dependencies */
const express = require('express');
const morgan = require('morgan');

const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

//  delete later

const fs = require('fs');
const path = require('path');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoute');

const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
// Serving static files
app.use(express.static(path.join(__dirname, 'public')));

// GLOBAL MIDDLEWARES

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Rate limiter
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many request from this IP. Please try again later',
});
app.use(helmet());
app.use('/api', limiter);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));

// Data sanitization against noSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS (cross-site scripting) attacks
app.use(xss()); // deprecated

// Prevent parameter pollution (duplicate fields in query string)
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
    ],
  }),
);

app.use((req, res, next) => {
  req.requestTime = new Date().toDateString();
  console.log('Hello from frightful middleware 🖐...');
  next();
});

app.use((req, res, next) => {
  console.log(req.requestTime);
  next();
});

///       ROUTES  *****

app.get('/', (req, res) => {
  res.status(200).render('base', {
    tour: 'The Sky Diver',
    user: 'Mako',
  });
});

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`),
);

app.get('api/v1/tours', (req, res) => {
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tours,
    },
  });
});

app.post('api/v1/tours', (req, res) => {
  console.log(req.body);
  const newId = tours[tours.length - 1].id + 1;
  // eslint-disable-next-line prefer-object-spread
  const newTour = Object.assign({ id: newId }, req.body);

  tours.push(newTour);
  fs.writeFileSync(
    `${__dirname}/dev-data/data/tours-simple.json`,
    tours,
    (err) => {
      if (err) console.error(err);
      res.status(200).json({
        message: 'success',
        data: {
          tour: newTour,
        },
      });
    },
  );
});

// app.get('/api/v1/tours', getAllTours);
// app.get('/api/v1/tours/:id/:name?', getTour);
// app.post('/api/v1/tours', createTour);
// app.patch('/api/v1/tours/:id', updateTour);
// app.delete('/api/v1/tours/:id', deleteTour);

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

app.all('*', (req, res, next) => {
  // res.status(404).json({
  //   status: 'fail',
  //   message: `Can't find ${req.originalUrl}`,
  // });
  // const err = new Error(`Can't find ${req.originalUrl}`);
  // err.status = 'fail';
  // err.statusCode = 404;
  next(new AppError(`Can't find ${req.originalUrl}`, 404));
});

// ERROR HANDLER

app.use(globalErrorHandler);

//     starting server

module.exports = app;
