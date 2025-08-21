const nodemailer = require('nodemailer');

const sendEmail = async ({ to, subject, text }) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'Gmail', // or your SMTP provider
      auth: {
        user: process.env.SMTP_EMAIL, // your email
        pass: process.env.SMTP_PASSWORD, // your email password or app password
      },
    });

    await transporter.sendMail({
      from: `"KaloOne Support" <${process.env.SMTP_EMAIL}>`,
      to,
      subject,
      text,
    });

    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error('Email send error:', error);
    throw new Error('Email could not be sent');
  }
};

module.exports = sendEmail;
