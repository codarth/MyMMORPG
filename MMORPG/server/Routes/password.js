import express from 'express';
import hbs from 'nodemailer-express-handlebars';
import nodemailer from 'nodemailer';
import path from 'path';
import crypto from 'crypto';

import UserModel from '../models/UserModel';

const email = process.env.EMAIL;
const password = process.env.PASSWORD;

const smtpTransport = nodemailer.createTransport({
  service: process.env.EMAIL_PROVIDER,
  auth: {
    user: email,
    pass: password,
  },
});

const handleBarsOptions = {
  viewEngine: {
    extName: '.hbs',
    defaultLayout: null,
    partialsDir: './templates/',
    layoutsDir: './templates/',
  },
  viewPath: path.resolve('./templates/'),
  extName: '.html',
};

smtpTransport.use('compile', hbs(handleBarsOptions));

const router = express.Router();

router.post('/forgotpassword', async (request, response) => {
  const userEmail = request.body.email;
  const user = await UserModel.findOne({ email: userEmail });
  if (!user) {
    response.status(400).json({ message: 'Invalid Email', status: 400 });
    return;
  }

  // Create user token
  const buffer = crypto.randomBytes(20);
  const token = buffer.toString('hex');

  // update user reset password token and exp
  await UserModel.findByIdAndUpdate({ _id: user._id },
    { resetToken: token, resetTokenExp: Date.now() + 600000 });

  // Send user password reset email
  const emailOptions = {
    to: userEmail,
    from: email,
    template: 'forgotpassword',
    subject: 'Zenva MMO password Reset',
    context: {
      name: 'jo',
      url: `http://localhost:${process.env.PORT || 3000}/?token=${token}&scene=resetPassword`,
    },
  };
  await smtpTransport.sendMail(emailOptions);

  response.status(200).json({ message: 'An Email has been sent to your email address. Password link is only good for 10 minutes.', status: 200 });
});

router.post('/resetpassword', async (request, response) => {
  const userEmail = request.body.email;
  const user = await UserModel.findOne({
    resetToken: request.body.token,
    resetTokenExp: { $gt: Date.now() },
    email: userEmail,
  });

  if (!user) {
    response.status(400).json({ message: 'Invalid token', status: 400 });
    return;
  }

  // Ensure password provided, and matches  verifiypassword
  if (!request.body.password
    || !request.body.verifiedPassword
    || request.body.password !== request.body.verifiedPassword) {
    response.status(400).json({ message: 'Passwords do not match', status: 400 });
    return;
  }

  // Update user model
  user.password = request.body.password;
  user.resetToken = undefined;
  user.resetTokenExp = undefined;
  await user.save();

  // Send user password update email
  const emailOptions = {
    to: userEmail,
    from: email,
    template: 'resetpassword',
    subject: 'Zenva MMO password Reset Confirmation',
    context: {
      name: user.username,
    },
  };
  await smtpTransport.sendMail(emailOptions);

  response.status(200).json({ message: 'Password updated', status: 200 });
});

export default router;
