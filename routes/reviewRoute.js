const express = require('express');
const authController = require('../controllers/authController');
const reviewController = require('../controllers/reviewController');

const router = express.Router({ mergeParams: true }); // mergeParams allows us access params from parent route. so this reviewRoute is nested inside tourRoute and by mergeParams it can access tourRoute's params tourId
// so its same as
// POST /tours/:tourId/reviews
// POST /reviews
// GET /tours/:tourId/reviews

router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
    authController.protect,
    authController.restrictTo('user'),
    reviewController.setTourAndUserIds,
    reviewController.createReview,
  );

router
  .route('/:reviewId')
  .get(reviewController.getReview)
  .patch(reviewController.updateReview)
  .delete(reviewController.DeleteReview);

module.exports = router;
