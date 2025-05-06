//const jwt = require('jsonwebtoken');
//const User = require('../models/userModel');
const AppError = require('../utils/appError');

const Tour = require('../models/tourModel');
const Booking = require('../models/bookingModel');
const catchAsync = require('../utils/catchAsync');
const User = require('../models/userModel');

exports.getOverview = catchAsync(async (req, res) => {
  // 1) get tours data from collection/db
  const tours = await Tour.find();
  // 2) build template

  // 3) render tours with template

  res.status(200).render('overview', {
    title: 'Exciting tours for adventurous people',
    tours,
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user',
  });

  if (!tour) {
    return next(new AppError('There is no tour with that name', 404));
  }

  res.status(200).render('tour', {
    title: `${tour.name}`,
    tour,
  });
});

exports.getLoginForm = (req, res) => {
  res.status(200).render('login', {
    title: 'Login',
  });
};
exports.getAccount = async (req, res, next) => {
  res.status(200).render('account', {
    title: 'My account',
  });
};

exports.getMyTours = catchAsync(async (req, res, next) => {
  //1) Find all bookings

  const bookings = await Booking.find({ user: req.user.id });
  // 2) Find tours with returned IDs
  const tourIDs = bookings.map((el) => el.tour);
  const tours = await Tour.find({ _id: { $in: tourIDs } });

  res.status(200).render('overview', {
    title: 'My tours',
    tours,
  });
});
exports.updateUserData = catchAsync(async (req, res, next) => {
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    {
      name: req.body.name,
      email: req.body.email,
    },
    {
      new: true,
      runValidate: true,
    },
  );
  res.status(200).render({
    title: 'My account',

    user: updatedUser,
  });
});

// exports.login = catchAsync(async (req, res, next) => {
//   const { email, password } = req.body;
//   if (!email || !password) {
//     return next(new AppError('Provide email and password', 400));
//   }

//   const user = User.findOne({ email: email }).select('+password');

//   if (!user || !(await user.correctPassword(password, user.password))) {
//     return next(new AppError('Invalid credentials', 401));
//   }

//   const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
//     expiresIn: '1d',
//   });

//   const cookieOptions = {
//     expires: new Date(process.env.JWT_TOKEN_EXPIRES_IN * 24 * 60 * 60 * 1000),
//     secure: false,
//     httpOnly: true,
//   };
//   if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

//   res.cookie('jwt', token, cookieOptions);
//   user.password = undefined;
//   res.status(200).json({
//     status: 'success',
//     data: {
//       data: user,
//     },
//   });
// });
