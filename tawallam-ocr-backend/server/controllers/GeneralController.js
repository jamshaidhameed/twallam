const express = require("express");
const { addSettingValidation, editSettingValidation, getSettingValidation, deleteSettingValidation } = require("../helpers/GeneralValidation");
const { apiResponse } = require("../utils/index");
const { addSettingModel, editSettingModel, getSettingPageModel, listSettingsModel, deleteSettingPageModel } = require("../repositories/GeneralRepositroy");

exports.addSetting = async (req, res) => {
  const { error } = addSettingValidation(req.body);
  //   console.log(body);
  if (error) {
    return apiResponse(req, res, {}, 404, error.details[0].message);
  }
  //   console.log("abfd");
  var setting = await addSettingModel(req.body);
  //   console.log(req.body);
  //   console.log("adf");
  if (setting.lenght === 0) {
    return apiResponse(req, res, {}, 404, "Failed to Add General Setting");
  }
  return apiResponse(req, res, {}, 200, "General Setting Added Successfully");
};
exports.editSetting = async (req, res) => {
  const { error } = editSettingValidation(req.body);
  if (error) {
    return helpers.apiResponse(req, res, {}, 404, error.details[0].message);
  }
  var cms = await editSettingModel(req.body);
  //   console.log(req.body);
  if (cms.length === 0) {
    return apiResponse(req, res, {}, 404, "Failed to Edit Cms Page");
  }
  return apiResponse(req, res, {}, 200, "Cms Page Edited Successfully");
};
exports.getSetting = async (req, res) => {
  const payload = req.query;
  const { error } = getSettingValidation(payload);

  if (error) {
    return apiResponse(req, res, {}, 500, error.details[0].message);
  }
  const response = await getSettingPageModel(payload);
  if (response.length === 0) {
    return apiResponse(req, res, [], 200, "Record Not Exist");
  } else {
    return apiResponse(req, res, response, 200, "Record Found");
  }
};
exports.listSettings = async (req, res) => {
  const payload = req.query;
  //   console.log(payload);

  var list = await listSettingsModel(payload);

  if (list.length === 0) {
    return apiResponse(req, res, {}, 404, "No General Setting List Found.");
  }
  return apiResponse(req, res, list, 200, "Success");
};
exports.deleteSetting = async (req, res) => {
  const { error } = deleteSettingValidation(req.body);

  if (error) {
    return helpers.apiResponse(req, res, {}, 404, error.details[0].message);
  }
  var remove = await deleteSettingPageModel(req.body);

  if (remove.length === 0) {
    return apiResponse(req, res, {}, 404, "Failed to General Setting Delete");
  }
  return apiResponse(req, res, {}, 404, "General Setting Deleted Successfully");
};
