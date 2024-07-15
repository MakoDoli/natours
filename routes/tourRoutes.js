const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();

const tours = JSON.parse(
  fs.readFileSync(
    path.join(__dirname, '..', '/dev-data/data/tours-simple.json'),
    'utf8'
  )
);

// route handlers

const getAllTours = (req, res) => {
  console.log(req.requestTime);
  console.log(req.query);
  res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime,
    results: tours.length,
    data: { tours: tours },
  });
};

const getTour = (req, res) => {
  console.log(req.params);

  const id = req.params.id * 1;
  const tour = tours.find((el) => el.id === id);
  //if (id > tours.length) or
  if (!tour) {
    return res.status(404).send({ status: 'fail', message: 'No tour found' });
  }
  res.status(200).json({
    status: 'success',
    data: { tour },
  });
};

const createTour = (req, res) => {
  const newTour = Object.assign({ id: tours.length + 1, ...req.body });
  console.log(newTour);
  res.send('Done');

  tours.push(newTour);
  fs.writeFileSync(
    path.join(__dirname, '/dev-data/data/tours-simple.json'),
    JSON.stringify(tours, null, 2)
  );
  res.status(201).json({
    status: 'success',
    data: { tour: newTour },
  });
};

const updateTour = (req, res) => {
  const id = req.params.id * 1;
  const tour = tours.find((el) => el.id === id);
  //if (id > tours.length) or
  if (!tour) {
    return res.status(404).send({ status: 'fail', message: 'No tour found' });
  }
  res.status(200).json({
    status: 'success',
    data: {
      tour: '<Updated tour here>',
    },
  });
};

const deleteTour = (req, res) => {
  const id = req.params.id * 1;
  if (id > tours.length) {
    res.status(404).send({ status: 'failed', message: 'No tour found' });
  }
  const newTours = tours.filter((el) => el.id !== id);

  fs.writeFileSync(
    path.join(__dirname, '/dev-data/data/tours-simple.json'),
    JSON.stringify(newTours, null, 2)
  );
  res.status(201).json({ message: 'success', data: { tours } });
};

router.route('/').get(getAllTours).post(createTour);

// chaining methods

router
  .route('/:id')
  .get(getTour)
  .post(createTour)
  .patch(updateTour)
  .delete(deleteTour);

module.exports = router;
