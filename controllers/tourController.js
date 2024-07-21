/* eslint-disable import/no-useless-path-segments */
/* eslint-disable node/no-unsupported-features/es-syntax */
// eslint-disable-next-line import/order, import/no-useless-path-segments
const Tour = require('./../models/tourModel');
const APIfeatures = require('./../utils/apiFeatures');
// const tours = JSON.parse(
//   fs.readFileSync(
//     path.join(__dirname, '..', '/dev-data/data/tours-simple.json'),
//     'utf8',
//   ),
// );

// route handlers

exports.getAllTours = async (req, res) => {
  try {
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
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: `Failed to get tours. Error: ${err.message}`,
    });
  }
};

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = 5;
  req.query.sort = 'price,-ratingsQuantity';
  req.query.fields = 'name,price,duration';
  next();
};

exports.getTour = async (req, res) => {
  console.log(req.params);
  try {
    const tour = await Tour.findById(req.params.id);
    res.status(200).json({
      status: 'success',
      requestedAt: req.requestTime,
      data: { tour: tour },
    });
  } catch (err) {
    res.status(404).json({
      status: 'failed',
      message: err.message,
    });
  }
};

exports.createTour = async (req, res) => {
  // const newTour = new Tour({});
  // newTour.save()
  try {
    const newTour = await Tour.create(req.body);

    res.status(201).json({
      status: 'success',
      data: { tour: newTour },
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({ status: 'failed', message: err.message });
  }
  // const newTour = Object.assign({ id: tours.length + 1, ...req.body });
  // console.log(newTour);

  // tours.push(newTour);
  // fs.writeFileSync(
  //   path.join(__dirname, '..', '/dev-data/data/tours-simple.json'),
  //   JSON.stringify(tours, null, 2),
  // );
};

exports.updateTour = async (req, res) => {
  // const id = req.params.id * 1;

  try {
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
  } catch (err) {
    res.status(404).json({ status: 'error', message: err.message });
  }
};
exports.deleteTour = async (req, res) => {
  try {
    await Tour.findByIdAndDelete(req.params.id);
    res.status(204).json({
      status: 'success',
      message: 'Tour deleted successfully',
      data: null,
    });
  } catch (err) {
    res.status(404).json({
      status: 'error',
      message: err.message,
    });
  }
  //const id = req.params.id * 1;
  //const newTours = tours.filter((el) => el.id !== id);
  // fs.writeFileSync(
  //   path.join(__dirname, '..', '/dev-data/data/tours-simple.json'),
  //   JSON.stringify(newTours, null, 2),
  // );
  //res.status(201).json({ message: 'success', data: { tours } });
};

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

exports.getTourStats = async (req, res) => {
  try {
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
  } catch (err) {
    res.status(404).json({
      status: 'error',
      message: err.message,
    });
  }
};

exports.getMonthlyPlan = async (req, res) => {
  try {
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
  } catch (err) {
    res.status(404).json({
      status: 'error',
      message: err.message,
    });
  }
};
