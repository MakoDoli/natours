/* eslint-disable import/no-useless-path-segments */
/* eslint-disable node/no-unsupported-features/es-syntax */
// eslint-disable-next-line import/order, import/no-useless-path-segments
const Tour = require('./../models/tourModel');
const APIfeatures = require('./../utils/apiFeatures');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
// const tours = JSON.parse(
//   fs.readFileSync(
//     path.join(__dirname, '..', '/dev-data/data/tours-simple.json'),
//     'utf8',
//   ),
// );

// route handlers

exports.getAllTours = catchAsync(async (req, res) => {
  const features = new APIfeatures(Tour.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const tours = await features.query;

  //   3) send response of query
  res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime,
    results: tours.length,
    data: { tours: tours },
  });
});

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = 5;
  req.query.sort = 'price,-ratingsQuantity';
  req.query.fields = 'name,price,duration';
  next();
};

exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.id);
  if (!tour) {
    return next(new AppError('No tour found with that ID', 404));
  }
  res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime,
    data: { tour: tour },
  });
});

exports.createTour = catchAsync(async (req, res, next) => {
  // const newTour = new Tour({});
  // newTour.save()

  const newTour = await Tour.create(req.body);

  res.status(201).json({
    status: 'success',
    data: { tour: newTour },
  });
});

exports.updateTour = catchAsync(async (req, res, next) => {
  // const id = req.params.id * 1;

  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    status: 'success',
    data: {
      tour: tour,
    },
  });
});
exports.deleteTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndDelete(req.params.id);
  if (!tour) {
    return next(new AppError('No tour found with that ID', 404)); // if no tour is found, return an error with status code 404 and a custom error message
  }
  res.status(204).json({
    status: 'success',
    message: 'Tour deleted successfully',
    data: null,
  });
});

exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        // _id: null,
        _id: '$difficulty',
        num: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
      //$sort: { $avgPrice: 1 },
      //$match: { _id: { $ne: 'easy' } },
    },
  ]);
  res.status(200).json({
    status: 'success',
    data: { stats: stats },
  });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1;
  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTourStarts: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
    {
      $addFields: { month: '$_id' },
    },
    {
      $project: { _id: 0 },
    },
    {
      $sort: { numTourStarts: -1 },
    },
    // {
    //   $limit: 5,
    // },
  ]);

  res.status(200).json({
    status: 'success',
    data: { plan },
  });
});

// createNewTour

// const newTour = Object.assign({ id: tours.length + 1, ...req.body });
// console.log(newTour);

// tours.push(newTour);
// fs.writeFileSync(
//   path.join(__dirname, '..', '/dev-data/data/tours-simple.json'),
//   JSON.stringify(tours, null, 2),
// );

// deleteTour
//const id = req.params.id * 1;
//const newTours = tours.filter((el) => el.id !== id);
// fs.writeFileSync(
//   path.join(__dirname, '..', '/dev-data/data/tours-simple.json'),
//   JSON.stringify(newTours, null, 2),
// );
//res.status(201).json({ message: 'success', data: { tours } });

//checkID
// exports.checkID = (req, res, next, val) => {
//   console.log(`Tour id is ${val} `);
//   const id = req.params.id * 1;
//   if (id > tours.length) {
//     return res
//       .status(404)
//       .send({ status: 'failed', message: `No tour found with id: ${id}` });
//   }
//   next();
// };
