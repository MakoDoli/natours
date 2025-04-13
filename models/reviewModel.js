const mongoose = require('mongoose');
const Tour = require('./tourModel');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review can not be empty'],
      minLength: 4,
      maxLength: [200, 'Your review is running too long'],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    user: [{ type: mongoose.Schema.ObjectId, ref: 'User' }],
    tour: [{ type: mongoose.Schema.ObjectId, ref: 'Tour' }],
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

reviewSchema.index({ tour: 1, user: 1 }, { unique: true }); // user can only review a tour once. Combination of both tour and user must be unique
reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'name photo',
  });
  // .populate({
  //   path: 'tour',
  //   select: 'name',
  // });
  next();
});

reviewSchema.statics.calcAverageRatings = async function (tourId) {
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);

  //update tour's ratings
  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating,
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5,
    });
  }
};

// after a review is created or updated with 'post', The constructor is used to access the static method calcAverageRatings

reviewSchema.post('save', function () {
  this.constructor.calcAverageRatings(this.tour); // current query middleware

  //next(); 'post' cannot use next() because it is not a document middleware function
});

// Following sequence of pre and post middleware is used to calculate the average ratings
// The pre middleware is used to find the review before updating it
// In fact, tour/tourId is passed from pre to post,so 'this.rev' is the tour where review was updated or deleted
reviewSchema.pre(/^findOneAnd/, async function (next) {
  this.rev = await this.findOne();
  next();
});
reviewSchema.post(/^findOneAnd/, async function () {
  await this.rev.constructor.calcAverageRatings(this.rev.tour);
});
const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
