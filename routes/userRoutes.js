const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);

router.post('/forgotPassword/', authController.forgotPassword);
router.patch('/resetpassword/:token', authController.resetPassword);
// Below this line all routes will be protected by middleware, so we can remove 'authController.protect' from each route, but I'm leaving them to remember how it was initially
router.use(authController.protect); // by THIS!

router.patch('/updateMyPassword', authController.updatePassword);
router.patch('/updateMe', userController.updateMe);
router.delete('/deleteMe', authController.protect, userController.deleteMe);
router
  .route('/me')
  .get(authController.protect, userController.getMe, userController.getUser);

// Below this line, only admins can access all routes

router.use(authController.restrictTo('admin'));

router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);

router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
