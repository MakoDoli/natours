// eslint-disable-next-line import/order, import/no-useless-path-segments
//const Tour = require('./../models/tourModel');
//const fs = require('fs');
//const path = require('path');

// const tours = JSON.parse(
//   fs.readFileSync(
//     path.join(__dirname, '..', '/dev-data/data/tours-simple.json'),
//     'utf8',
//   ),
// );

// route handlers

exports.checkID = (req, res, next, val) => {
  console.log(`Tour id is ${val} `);
  //const id = req.params.id * 1;
  // if (id > tours.length) {
  //   return res
  //     .status(404)
  //     .send({ status: 'failed', message: `No tour found with id: ${id}` });
  // }
  next();
};

exports.checkBody = (req, res, next) => {
  if (!req.body.name || !req.body.price) {
    return res.status(400).json({
      status: 'failed',
      message: 'Invalid data. Name and price are required.',
    });
  }
  next();
};

exports.getAllTours = (req, res) => {
  console.log(req.requestTime);
  console.log(req.query);
  res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime,
    // results: tours.length,
    // data: { tours: tours },
  });
};

exports.getTour = (req, res) => {
  console.log(req.params);

  // const id = req.params.id * 1;
  // const tour = tours.find((el) => el.id === id);
  //if (id > tours.length) or
  // if (!tour) {
  //   return res.status(404).send({ status: 'fail', message: 'No tour found' });
  // }
  res.status(200).json({
    status: 'success',
    // data: { tour },
  });
};

exports.createTour = (req, res) => {
  // eslint-disable-next-line prefer-object-spread, node/no-unsupported-features/es-syntax
  // const newTour = Object.assign({ id: tours.length + 1, ...req.body });
  // console.log(newTour);

  // tours.push(newTour);
  // fs.writeFileSync(
  //   path.join(__dirname, '..', '/dev-data/data/tours-simple.json'),
  //   JSON.stringify(tours, null, 2),
  // );
  res.status(201).json({
    status: 'success',
    // data: { tour: newTour },
  });
};

exports.updateTour = (req, res) => {
  // const id = req.params.id * 1;
  // const tour = tours.find((el) => el.id === id);

  res.status(200).json({
    status: 'success',
    data: {
      tour: '<Updated tour here>',
    },
  });
};

exports.deleteTour = (req, res) => {
  //const id = req.params.id * 1;
  //const newTours = tours.filter((el) => el.id !== id);
  // fs.writeFileSync(
  //   path.join(__dirname, '..', '/dev-data/data/tours-simple.json'),
  //   JSON.stringify(newTours, null, 2),
  // );
  //res.status(201).json({ message: 'success', data: { tours } });
};
