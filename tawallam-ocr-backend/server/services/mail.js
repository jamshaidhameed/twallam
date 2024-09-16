const nodemailer = require("nodemailer");
const ejs = require("ejs");
const _ = require("lodash");
const logger = require("@base/logger");
const config = require("@config");
const { host, port, userName, password, fromAddress, fromName } = config.mail;

const sendEmail = async (options) => {
  return new Promise(async (resolve, reject) => {
    const { email, subject, file_name } = options;
    const data = _.omit(options, ["email", "subject", "file_name"]);
    data.from_name = fromName;
    data.base_url = process.env.APP_BASE_URL;
    data.company_phone = process.env.COMPANY_PHONE;
    data.type = options.type != undefined ? options.type : "";
    if (data.type != undefined) {
      data.name = options.name != undefined && data.type == "admin" ? options.name : "";
      data.phone = options.phone != undefined && data.type == "admin" ? options.phone : "";
      data.date = options.date != undefined && data.type == "admin" ? options.date : "";
      data.description = options.description != undefined && data.type == "admin" ? options.description : "";
      data.sender_email = options.sender_email != undefined && data.type == "admin" ? options.sender_email : "";
    }
    ejs.renderFile(`${__dirname}/../views/emails/${file_name}.ejs`, { data }, async (err, html) => {
      if (err) return logger.warn(`Email send error:`, err);

      let transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.MAIL_USERNAME, // Your Gmail address
          pass: process.env.MAIL_PASSWORD, // Your Gmail password or App Password
        },
      });
      // Set up email data with unicode symbols
      let mailOptions = {
        from: `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_USERNAME}>`, // Sender address
        to: email, // List of recipients
        subject: subject, // Subject line
        text: "Hello world?", // Plain text body
        html: html, // HTML body
      };

      // Send mail with defined transport object
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log(error);
          resolve(error);
        }
        console.log("Message sent: %s", info.messageId);
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
        resolve(info);
      });

      // const transporter = nodemailer.createTransport({
      //   host,
      //   port,
      //   auth: {
      //     user: userName,
      //     pass: password,
      //   },
      // });

      // const message = {
      //   // from: fromAddress,
      //   from: {
      //     name: fromName,
      //     address: fromAddress,
      //   },
      //   to: email,
      //   subject,
      //   html,
      // };

      // transporter.sendMail(message, (error, info) => {
      //   if (error) {
      //     resolve(error);
      //   } else {
      //     resolve(info);
      //   }
      // });
    });
  });
};

module.exports = sendEmail;
