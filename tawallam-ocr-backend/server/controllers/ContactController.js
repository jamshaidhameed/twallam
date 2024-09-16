const express = require("express");
const { apiResponse } = require("../utils/index");
const sendEmail = require("../services/mail");
const { addContactValidation, editContactValidation, getContactValidation, deleteContactValidation, contactUsValidation, subscriberValidation } = require("../helpers/ContactValidation");
const { ContactModel, editContactModel, listContactModel, getContactModel, deleteContactModel, addSubscriberModel, getSubscriberModel } = require("../repositories/ContactRepository");
const { getSuperAdminModel } = require("../repositories/authRepository");
const router = express.Router();

exports.addContact = async (req, res) => {
  const { error } = addContactValidation(req.body);
  if (error) {
    return apiResponse(req, res, {}, 400, error.details[0].message);
  }
  var contact = await ContactModel(req.body);

  if (contact.length === 0) {
    return apiResponse(req, res, {}, 404, "Failed to Add Contact");
  }
  return apiResponse(req, res, {}, 200, "Contact Form Successfully Added");
};

exports.editContact = async (req, res) => {
  const { error } = editContactValidation(req.body);
  if (error) {
    return helpers.apiResponse(req, res, {}, 404, error.details[0].message);
  }
  var Contact = await editContactModel(req.body);
  //   console.log(req.body);
  if (Contact.length === 0) {
    return apiResponse(req, res, {}, 404, "Failed to Edit Contact");
  }
  return apiResponse(req, res, {}, 200, "Contact Edited Successfully");
};

exports.listContacts = async (req, res) => {
  const payload = req.query;
  //   console.log(payload);

  var contact = await listContactModel(payload);

  if (contact.length === 0) {
    return apiResponse(req, res, {}, 404, "No Page List Found.");
  }
  return apiResponse(req, res, contact, 200, "Success");
};

exports.getContact = async (req, res) => {
  const payload = req.query;
  const { error } = getContactValidation(payload);

  if (error) {
    return apiResponse(req, res, {}, 500, error.details[0].message);
  }
  const response = await getContactModel(payload);
  if (response.length === 0) {
    return apiResponse(req, res, [], 200, "Record Not Exist");
  } else {
    return apiResponse(req, res, response, 200, "Record Found");
  }
};

exports.deleteContact = async (req, res) => {
  const { error } = deleteContactValidation(req.body);

  if (error) {
    return helpers.apiResponse(req, res, {}, 404, error.details[0].message);
  }
  var remove = await deleteContactModel(req.body);

  if (remove.length === 0) {
    return apiResponse(req, res, {}, 404, "Failed to Contact Delete");
  }
  return apiResponse(req, res, {}, 404, "Contact Deleted Successfully");
};

exports.contactUs = async (req, res) => {
  const { error } = contactUsValidation(req.body);
  if (error) {
    return apiResponse(req, res, {}, 400, error.details[0].message);
  }

  var super_admin_user = await getSuperAdminModel();

  const { email } = super_admin_user[0];

  var options = {
    name: req.body.userName,
    email: email,
    phone: req.body.mobile,
    subject: req.body.subject != undefined ? req.body.subject : "Contact Us",
    date: req.body.date || new Date(),
    time: req.body.time || "",
    description: req.body.description,
    file_name: "contact_us",
    type: "admin",
  };
  const mail_sent = await sendEmail(options);

  if (mail_sent == false) {
    return apiResponse(req, res, {}, 404, "Failed to send email.");
  } else {
    options.email = req.body.email;
    options.type = "user";
    const mail_sent_user = await sendEmail(options);

    if (mail_sent_user == false) {
      return apiResponse(req, res, {}, 404, "Failed to send email.");
    } else {
      return apiResponse(req, res, {}, 200, "Email sent successfully");
    }

    // return apiResponse(req, res, {}, 200, "Email sent successfully");
  }
};

exports.addSubscriber = async (req, res) => {
  const { error } = subscriberValidation(req.body);
  if (error) {
    return apiResponse(req, res, {}, 400, error.details[0].message);
  }

  var is_already_subscriber = await getSubscriberModel(req.body);
  if (is_already_subscriber.length > 0) {
    return apiResponse(req, res, {}, 404, "You have already subscribed");
  }

  var subscriber = await addSubscriberModel(req.body);
  if (subscriber.length === 0) {
    return apiResponse(req, res, {}, 404, "Failed to Add Subscriber");
  }

  var super_admin_user = await getSuperAdminModel();

  var options = {
    email: req.body.email,
    subject: "Add Subscriber",
    file_name: "subscriber_confirmation",
    type: "user",
  };

  const mail_sent = await sendEmail(options);

  if (mail_sent == false) {
    return apiResponse(req, res, {}, 404, "Failed to send email.");
  } else {
    const { email } = super_admin_user[0];
    options.email = email;
    options.sender_email = req.body.email;
    options.type = "admin";
    const mail_sent_admin = await sendEmail(options);
    if (mail_sent_admin == false) {
      return apiResponse(req, res, {}, 404, "Failed to send email.");
    } else {
      return apiResponse(req, res, {}, 200, "Subscriber Form Successfully Added");
    }

    // return apiResponse(req, res, {}, 200, "Email sent successfully");
  }

  // return apiResponse(req, res, {}, 200, "Subscriber Form Successfully Added");
};
