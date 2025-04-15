/* eslint-disable prefer-template */
// eslint-disable-next-line import/no-extraneous-dependencies
const mongoose = require('mongoose');
const fs = require('fs');
const dotenv = require('dotenv');
const Tour = require('../../models/tourModel');
const User = require('../../models/userModel');
const Review = require('../../models/reviewModel');

dotenv.config();

// .connect(process.env.DATABASE_LOCAL, {}) if database is running in local terminal
const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD,
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => {
    console.log('CONNECTION SUCCESSFUL✅');
  });

//   READ JSON FILE

const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));
const reviews = JSON.parse(
  fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8'),
);

// IMPORT JSON INTO DB

const importData = async () => {
  try {
    // await Tour.deleteMany({});
    // console.log('Data deleted successfully');

    //await Tour.create(tours);
    await User.create(users, { validateBeforeSave: false });
    //await Review.create(reviews);
    console.log('Data imported successfully');
  } catch (error) {
    console.error('Error importing data', error);
  }
  process.exit();
};

// DELETE ALL DATA FROM DB

const deleteData = async () => {
  try {
    //await Tour.deleteMany();
    await User.deleteMany();
    //await Review.deleteMany();
    console.log('Data deleted successfully');
  } catch (err) {
    console.error('Error deleting data', err);
  }
  process.exit();
};
if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}

// to insert new command to process.argv, we run 'node <pathToCurrentFile> --<commandName> in terminal

console.log(process.argv);
