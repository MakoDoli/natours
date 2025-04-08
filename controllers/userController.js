// Route handlers

const User = require('../models/userModel');
const AppError = require('../utils/appError');

const filteredObj = (body, ...allowedFields) => {
  const filteredBody = {};
  Object.keys(body).forEach((key) => {
    if (allowedFields.includes(key)) {
      filteredBody[key] = body[key];
    }
  });
};

exports.getAllUsers = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'Route is not defined',
  });
};

exports.updateMe = async (req, res, next) => {
  //1) Create error if user POSTs password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password update. Please use /updateMyPassword instead',
        400,
      ),
    );
  }
  // 2) filter out unwanted fields/keys names that are not allowed to be updated

  const filteredBody = filteredObj(req.body, 'name', 'email');

  // 3) Update user document
  // Here we can use finByIdAndUpdate because no sensitive data (as password)
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    validators: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
};

exports.getUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'Route is not defined',
  });
};
exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'Route is not defined',
  });
};
exports.updateUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'Route is not defined',
  });
};
exports.deleteUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'Route is not defined',
  });
};
