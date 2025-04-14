const express = require('express');
const viewController = require('../controllers/viewController');

const router = express.Router();

router.get('/', viewController.getOverview);

// router.get('/', (req, res) => {
//   res.status(200).render('overview', {
//     title: 'All Tours',
//   });
// });
router.get('/tour', viewController.getTour);

module.exports = router;
