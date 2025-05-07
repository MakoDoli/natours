/* eslint-disable import/no-extraneous-dependencies */
const express = require('express');
const morgan = require('morgan');

const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const cors = require('cors');

//  delete later

//const fs = require('fs');
const path = require('path');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoute');
const bookingRouter = require('./routes/bookingRoutes');
const bookingController = require('./controllers/bookingController');
const viewRouter = require('./routes/viewRoutes');

const app = express();

app.enable('trust proxy'); // for heroku

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
// Serving static files
app.use(express.static(path.join(__dirname, 'public')));

// GLOBAL MIDDLEWARES

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(cors({})); // without options it allows all origins
// Access-Control-Allow-origin *

// app.use(cors({
// origin: "frontend-site.com"
//}))

// for preflight requests, such as patch, put, delete
// parameters: route, handler
app.options('*', cors());
//app.options('/api/v1/tours/:id', cors()); // only for specific route

// Rate limiter
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many request from this IP. Please try again later',
});
app.use(helmet());
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        'https://cdnjs.cloudflare.com/',
        'https://js.stripe.com/',
        "'unsafe-inline'",
      ],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      imgSrc: [
        "'self'",
        'data:',
        'https://*.tile.openstreetmap.org',
        'https://raw.githubusercontent.com',
      ],
      connectSrc: ["'self'", 'ws://localhost:*', 'https://api.stripe.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
      frameSrc: ["'self'", 'https://js.stripe.com', 'https://hooks.stripe.com'],
    },
  }),
);
app.use('/api', limiter);

// we define this route here before express.json() parser because stripe needs body in raw format,not parsed as json
app.post(
  '/webhook-checkout',
  express.raw({ type: 'application/json' }),
  bookingController.webhookCheckout,
);

// Body parser, reading data from body into req.body
//Cookie parser, reading token in cookie
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' })); // for form data action url
app.use(cookieParser());

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

app.use(compression()); // compresses text response

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
// app.use((req, res, next) => {
//   res.setHeader(
//     'Content-Security-Policy',
//     "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://*.tile.openstreetmap.org;",
//   );
//   next();
// });
app.use(
  '/leaflet',
  express.static(path.join(__dirname, 'node_modules/leaflet/dist')),
);
app.use('/', viewRouter);

// app.get('/api/v1/tours', getAllTours);
// app.get('/api/v1/tours/:id/:name?', getTour);
// app.post('/api/v1/tours', createTour);
// app.patch('/api/v1/tours/:id', updateTour);
// app.delete('/api/v1/tours/:id', deleteTour);

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

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
// const tours = JSON.parse(
//   fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`),
// );

// app.get('api/v1/tours', (req, res) => {
//   res.status(200).json({
//     status: 'success',
//     results: tours.length,
//     data: {
//       tours,
//     },
//   });
// });

// app.post('api/v1/tours', (req, res) => {
//   console.log(req.body);
//   const newId = tours[tours.length - 1].id + 1;
//   // eslint-disable-next-line prefer-object-spread
//   const newTour = Object.assign({ id: newId }, req.body);

//   tours.push(newTour);
//   fs.writeFileSync(
//     `${__dirname}/dev-data/data/tours-simple.json`,
//     tours,
//     (err) => {
//       if (err) console.error(err);
//       res.status(200).json({
//         message: 'success',
//         data: {
//           tour: newTour,
//         },
//       });
//     },
//   );
// });
