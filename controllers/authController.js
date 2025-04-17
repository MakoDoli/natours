/* eslint-disable node/no-unsupported-features/es-syntax */
/* eslint-disable arrow-body-style */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable import/no-useless-path-segments */
const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const sendEmail = require('./../utils/email');

const signToken = (id) =>
  jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: '1d', // exp better set in env
  });
// Create and send token as cookie to client
//
const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  const cookieOptions = {
    expires: new Date(
      Date.now() +
        Number(process.env.JWT_COOKIE_EXPIRES_IN) * 24 * 60 * 60 * 1000,
    ),
    secure: false, // true for https only
    httpOnly: true, // Can not be modified by client side JS
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
  res.cookie('jwt', token, cookieOptions);
  user.password = undefined; // remove password from output
  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const { name, email, password, passwordConfirm } = req.body;

  const newUser = await User.create({
    name,
    email,
    password,
    passwordConfirm,
    //role,
  });

  // const token = signToken(newUser._id);

  // res.status(201).json({
  //   status: 'success',
  //   data: {
  //     user: newUser,
  //   },
  //   token,
  // });
  createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }
  const user = await User.findOne({ email }).select('+password'); // +password is needed to select password explicitly, because we set 'password: select: false' in userModel

  // const correct = await user.correctPassword(password, user.password);

  const isPasswordCorrect = await user.correctPassword(password, user.password);

  if (!user || !isPasswordCorrect) {
    return next(new AppError('Incorrect credentials', 401));
  }

  createSendToken(user, 200, res);
});

exports.logout = catchAsync(async (req, res, next) => {
  res.cookie('jwt', 'logged out', {
    expires: new Date(Date.now() + 5 * 1000),
    httpOnly: true,
  });
  res.status(200).json({
    status: 'success',
  });
});

// Auth middleware

exports.protect = catchAsync(async (req, res, next) => {
  // 1) get token and check if it exists
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(new AppError('You are not logged in', 401));
  }
  // 2) Verification token

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3) cHECK IF USER STILL EXISTS
  const freshUser = await User.findById(decoded.id);

  if (!freshUser) {
    return next(new AppError('User no longer exists', 401));
  }
  // 4) Check is user changed password after the token was issued
  if (freshUser.changedPasswordAfter(decoded.iat)) {
    return next(new AppError('User recently changed password', 401));
  }
  // ALLOW access to protected route
  req.user = freshUser;
  res.locals.user = freshUser;
  next();
});

// only for rendered pages, no errors!
exports.isLoggedIn = async (req, res, next) => {
  // 1) get token and check if it exists
  if (req.cookies.jwt) {
    // 2) Verification token
    try {
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET,
      );

      // 3) cHECK IF USER STILL EXISTS
      const freshUser = await User.findById(decoded.id);

      if (!freshUser) {
        return next();
      }
      // 4) Check is user changed password after the token was issued
      if (freshUser.changedPasswordAfter(decoded.iat)) {
        return next();
      }
      // If we came upto here,user is logged in
      res.locals.user = freshUser;
      return next();
    } catch {
      return next();
    }
  }
  next();
};

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You are not allowed to perform this action '),
        403,
      );
    }
    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  //1) Get user by email

  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('No user with provided was found '), 404);
  }
  //2) Generate random reset token
  const resetToken = user.createPasswordResetToken;
  await user.save({ validateBeforeSave: false });
  //3) Send token to user's email

  const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;
  const message = `You are receiving this email because you (or someone else) has requested a password reset. Please click on the following link to complete the process: \n\n${resetURL}\n\nIf you did not make this request, please ignore this email and no changes will be made.`;
  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token',
      message,
    });
    res.status(200).json({
      status: 'success',
      message: 'Token sent to email',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpiresAt = undefined;
    await user.save({ validateBeforeSave: false });
    return next(
      new AppError(
        'There was an error sending the email. Try again later',
        500,
      ),
    );
  }
});
exports.resetPassword = async (req, res, next) => {
  // 1) get user based on token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpiresAt: { $gt: Date.now() },
  });

  // 2)if token is not expired and user exists,set new password
  if (!user) return next(new AppError('Invalid or expired token', 400));
  user.password = req.body.password;
  user.passwordResetToken = undefined;
  user.passwordResetExpiresAt = undefined;
  await user.save();
  // 3) update changedPasswordAt property
  // 4) Log user in and send new token

  const token = signToken(user._id);

  res.status(200).json({
    status: 'success',
    token,
    message: 'Password reset successful',
  });
};

exports.updatePassword = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+password');

  if (!user.correctPassword(req.body.currentPassword, user.password))
    return next(new AppError('Your current password is wrong', 401));
  user.password = req.body.newPassword;
  user.passwordConfirm = req.body.newPasswordConfirm; // this will be validated in userModel.js
  await user.save(); // this will trigger pre save hook and hash the password

  const token = signToken(user._id);

  res.status(200).json({
    status: 'success',
    token,

    data: {
      user,
    },
  });
});
