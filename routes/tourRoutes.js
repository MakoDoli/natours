const express = require('express');
const tourController = require('../controllers/tourController');

const router = express.Router();

router.param('id', tourController.checkID);

// chaining methods

const { getAllTours, getTour, createTour, deleteTour, updateTour } =
  tourController;

router.route('/').get(getAllTours).post(tourController.checkBody, createTour);

router.route('/:id').get(getTour).patch(updateTour).delete(deleteTour);

module.exports = router;
