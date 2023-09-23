const nodemailer = require("nodemailer");
require("dotenv").config();

const sendEmail = async (mail) => {
  const { from, to, subject, text, html } = mail;

  try {
    const nodeTrnasporter = nodemailer.createTransport({
      host: "smtp-relay.brevo.com",
      port: 587,
      auth: {
        user: process.env.USER,
        pass: process.env.Password,
      },
    });

    let details = await nodeTrnasporter.sendMail({
      from: from,
      to: to,
      subject: subject,
      text: text,
      html: html,
    });

    console.log(details.messageId);
    return details.messageId;
  } catch (error) {
    return Error(error);
  }
};

module.exports = sendEmail;
