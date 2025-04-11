const mongoose = require('mongoose');

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

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
