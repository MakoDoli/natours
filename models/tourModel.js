/* eslint-disable import/no-extraneous-dependencies */
// eslint-disable-next-line import/no-extraneous-dependencies
const mongoose = require('mongoose');
//const User = require('./userModel');
//const validator = require('validator');
//const slugify = require('slugify');

//  MONGOOSE SCHEMA

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
        values: ['easy', 'medium', 'difficult'],
        message: 'Choose right difficulty level',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating maximum is 5'],
      set: (val) => Math.round(val * 10) / 10,
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
    startLocation: {
      // GeoJson must have 'type' and 'coordinates'
      //GeoJson
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    // array of objects will create new document of 'locations'
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    //guides: Array, Array of user IDs to query user with those IDs for EMBEDDING
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } },
);
//   INDEXES   INDEXES
// DON'T OVERDO INDEXES!!!

// INDEXES take a lot of kbs in database so use them only when documents are large or many and its worth to use extra kbs for indexes
//tourSchema.index({ price: 1 }); individual index
// even if you delete index from code, it still remains in database, so need to explicitly delete it from database
tourSchema.index({ price: 1, ratingsAverage: -1 }); // compound index
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: '2dsphere' });

// VIRTUALS

tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});
// Virtual population
tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour', // field in review model
  localField: '_id', // field in tour model
});

// DOCUMENT Middleware: runs before .save() and .create()

// tourSchema.pre('save', function (next) {
//   this.slug = slugify(this.name, { lower: true });
//   next();
// });

// EMBEDDED GUIDES IN DOCUMENT

// tourSchema.pre('save', async function (next) {
//   const guidesPromises = this.guides.map(async (id) => User.findById(id));
//   const guides = await Promise.all(guidesPromises);
//   this.guides = guides;
//   next();
// });

// tourSchema.post('save', (doc, next) => {
//   console.log(doc);
//   next();
// });

//   QUERY Middleware
// in QUERY Middleware this always points to current query
// tourSchema.pre('find', function (next) {
tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
  next();
});
// populate is same as another query so it takes more time
tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangeAt',
  });
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

// MONGOOSE MODEL from SCHEMA

const Tour = mongoose.model('Tour', tourSchema);
// const testTour = new Tour({
//   name: 'The Park Camp',

//   price: 397,
// });

// SAVE to DATABASE

// testTour
//   .save()
//   .then((doc) => {
//     console.log(doc);
//   })
//   .catch((err) => console.log('Error ⛔: ' + err));

module.exports = Tour;
