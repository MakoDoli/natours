/* eslint-disable import/no-extraneous-dependencies */
// eslint-disable-next-line import/no-extraneous-dependencies
const mongoose = require('mongoose');

//const validator = require('validator');
//const slugify = require('slugify');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
      maxLength: [40, 'A tour name is too long'],
      minLength: [3, 'The tour name is too short'],
      // validator: [validator.isAlpha, 'Tour name must contain only letters'],
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
      min: [1, 'The duration must be at least 1 day'],
      max: [365, 'The duration must not exceed 365 days'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have difficulty level'],
      enum: {
        values: ['easy', 'medium', 'hard'],
        message: 'Choose right difficulty level',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating maximum is 5'],
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
      min: [10, 'The price must be at least $10'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          // works only when creating new document
          return val < this.price;
        },
        message: 'Discount cannot be more than the tour price',
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a description'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have an cover image'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

// DOCUMENT Middleware: runs before .save() and .create()

// tourSchema.pre('save', function (next) {
//   this.slug = slugify(this.name, { lower: true });
//   next();
// });

// tourSchema.post('save', (doc, next) => {
//   console.log(doc);
//   next();
// });

//   QUERY Middleware

// tourSchema.pre('find', function (next) {
tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
  next();
});

tourSchema.post(/^find/, function (docs, next) {
  console.log('Query took 📢c: ', Date.now() - this.start);
  // console.log(docs);
  next();
});

//   AGGREGATION Middleware

tourSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  console.log(this);
  next();
});

const Tour = mongoose.model('Tour', tourSchema);
// const testTour = new Tour({
//   name: 'The Park Camp',

//   price: 397,
// });

// testTour
//   .save()
//   .then((doc) => {
//     console.log(doc);
//   })
//   .catch((err) => console.log('Error ⛔: ' + err));

module.exports = Tour;
