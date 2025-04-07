/* eslint-disable import/no-extraneous-dependencies */
const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  //1) create transporter
  const transporter = nodemailer.createTransport({
    //service: 'Gmail',
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
    // ACTIVATE
  });
  //2) Define email options

  const mailOptions = {
    from: 'support <mailhere@gmail.com>',
    to: options.email,
    subject: options.subject,
    text: options.text,
    //html
  };

  // 3) Actually send the email

  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
