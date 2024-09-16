const express = require("express");
const { apiResponse } = require("../utils/index");
const { addCmsPageValidation, editCmsPageValidation, getCmsPageValidation, deleteCmsPageValidation } = require("../helpers/CmsPageValidation");
const { addCmsPageModel, editCmsPageModel, getCmsPageModel, listCmsPagesModel, deleteCmsPageModel } = require("../repositories/CmsPagesRepository");

// const route = express.Router();

exports.add_CmsPage = async (req, res) => {
  const { error } = addCmsPageValidation(req.body);
  //   console.log(body);
  if (error) {
    return apiResponse(req, res, {}, 404, error.details[0].message);
  }
  //   console.log("abfd");
  var page = await addCmsPageModel(req.body);
  //   console.log(req.body);
  //   console.log("adf");
  if (page.lenght === 0) {
    return apiResponse(req, res, {}, 404, "Failed to Add Page");
  }
  return apiResponse(req, res, {}, 200, "Page Added Successfully");
};
exports.editCmsPage = async (req, res) => {
  const { error } = editCmsPageValidation(req.body);
  if (error) {
    return helpers.apiResponse(req, res, {}, 404, error.details[0].message);
  }
  var cms = await editCmsPageModel(req.body);
  //   console.log(req.body);
  if (cms.length === 0) {
    return apiResponse(req, res, {}, 404, "Failed to Edit Cms Page");
  }
  return apiResponse(req, res, {}, 200, "Cms Page Edited Successfully");
};
exports.getCmsPage = async (req, res) => {
  const payload = req.query;
  const { error } = getCmsPageValidation(payload);

  if (error) {
    return apiResponse(req, res, {}, 500, error.details[0].message);
  }
  const response = await getCmsPageModel(payload);
  if (response.length === 0) {
    return apiResponse(req, res, [], 200, "Record Not Exist");
  } else {
    return apiResponse(req, res, response, 200, "Record Found");
  }
};
exports.listCmsPages = async (req, res) => {
  const payload = req.query;
  //   console.log(payload);

  var list = await listCmsPagesModel(payload);

  if (list.length === 0) {
    return apiResponse(req, res, {}, 404, "No Cms Pages List Found.");
  }
  return apiResponse(req, res, list, 200, "Success");
};

exports.deleteCmsPage = async (req, res) => {
  const { error } = deleteCmsPageValidation(req.body);

  if (error) {
    return helpers.apiResponse(req, res, {}, 404, error.details[0].message);
  }
  var remove = await deleteCmsPageModel(req.body);

  if (remove.length === 0) {
    return apiResponse(req, res, {}, 404, "Failed to Cms Page Delete");
  }
  return apiResponse(req, res, {}, 404, "Cms Page Deleted Successfully");
};
