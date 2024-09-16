const express = require("express");
const { apiResponse } = require("../utils/index");
const { addVendorValidation, editVendorValidation, getVendorValidation, deleteVendorValidation } = require("../helpers/VendorValidation");
const { addVendorModel, editVendorModel, getVendorModel, listVendorsModel, deleteVendorModel } = require("../repositories/VendorRepository");
const router = express.Router();

exports.addVendor = async (req, res) => {
  const { error } = addVendorValidation(req.body);
  if (error) {
    return apiResponse(req, res, {}, 400, error.details[0].message);
  }

  var vendor = await addVendorModel(req.body);

  if (vendor.length === 0) {
    return apiResponse(req, res, {}, 404, "Failed To Add Vendor");
  }
  return apiResponse(req, res, {}, 200, "Vendor Successfully Added");
};
exports.editVendor = async (req, res) => {
  const { error } = editVendorValidation(req.body);
  if (error) {
    return apiResponse(req, res, {}, 404, error.details[0].message);
  }

  var vendor = await editVendorModel(req.body);

  if (vendor.length === 0) {
    return apiResponse(req, res, {}, 404, "Failed to Edit Vendor");
  }
  return apiResponse(req, res, {}, 200, "Vendor Edited Successfully");
};

exports.getVendor = async (req, res) => {
  const { error } = getVendorValidation(req.query);
  //   console.log(req.query);
  if (error) {
    return apiResponse(req, res, {}, 404, error.details[0].message);
  }
  var Vendor = await getVendorModel(req.query);
  //   console.log(Vendor);
  if (Vendor.lenght === 0) {
    return apiResponse(req, res, {}, 404, "Failed to Get Vendor");
  }
  return apiResponse(req, res, Vendor, 200, "Vendor Get Successfully");
};

exports.listVendors = async (req, res) => {
  const payload = req.query;
  //   console.log(payload);

  var list = await listVendorsModel(payload);

  if (list.length === 0) {
    return apiResponse(req, res, {}, 404, "No Vendor List Found.");
  }
  return apiResponse(req, res, list, 200, "Success");
};
exports.deleteVendor = async (req, res) => {
  const { error } = deleteVendorValidation(req.body);

  if (error) {
    return helpers.apiResponse(req, res, {}, 404, error.details[0].message);
  }
  var Vendor = await deleteVendorModel(req.body);

  if (Vendor.length === 0) {
    return apiResponse(req, res, {}, 404, "Failed to Vendor Delete");
  }
  return apiResponse(req, res, {}, 404, "Vendor Deleted Successfully");
};
