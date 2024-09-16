const express = require("express");
const { addContectContentValidation, editContactContentValidation, getContactContentValidation, deleteContactContentValidation } = require("../helpers/CContentValidation");
const { addContectContentModel, editContactContentModel, listContactContentModel, getContactContentModel, deleteContactContentModel } = require("../repositories/CContentRepository");
const { apiResponse } = require("../utils/index");
const router = express.Router();
exports.addContectContent = async (req, res) => {
  const { error } = addContectContentValidation(req.body);
  if (error) {
    return apiResponse(req, res, {}, 400, error.details[0].message);
  }
  var contact = await addContectContentModel(req.body);

  if (contact.length === 0) {
    return apiResponse(req, res, {}, 404, "Failed to Add Contact Content");
  }
  return apiResponse(req, res, {}, 200, "Contact Content Form Successfully Added");
};

exports.editContactContent = async (req, res) => {
  const { error } = editContactContentValidation(req.body);
  if (error) {
    return helpers.apiResponse(req, res, {}, 404, error.details[0].message);
  }
  var Contact = await editContactContentModel(req.body);
  //   console.log(req.body);
  if (Contact.length === 0) {
    return apiResponse(req, res, {}, 404, "Failed to Edit Contect Content");
  }
  return apiResponse(req, res, {}, 200, "Contect Content Edited Successfully");
};

exports.listContactContent = async (req, res) => {
  const payload = req.query;
  //   console.log(payload);

  var list = await listContactContentModel(payload);

  if (list.length === 0) {
    return apiResponse(req, res, {}, 404, "No Contents List Found.");
  }
  return apiResponse(req, res, list, 200, "Success");
};

exports.getContactContent = async (req, res) => {
  const payload = req.query;
  const { error } = getContactContentValidation(payload);

  if (error) {
    return apiResponse(req, res, {}, 500, error.details[0].message);
  }
  const response = await getContactContentModel(payload);
  if (response.length === 0) {
    return apiResponse(req, res, [], 200, "Record Not Exist");
  } else {
    return apiResponse(req, res, response, 200, "Record Found");
  }
};

exports.deleteContactContent = async (req, res) => {
  const { error } = deleteContactContentValidation(req.body);

  if (error) {
    return helpers.apiResponse(req, res, {}, 404, error.details[0].message);
  }
  var remove = await deleteContactContentModel(req.body);

  if (remove.length === 0) {
    return apiResponse(req, res, {}, 404, "Failed to Contact Content Delete");
  }
  return apiResponse(req, res, {}, 404, "Contact Content Deleted Successfully");
};
