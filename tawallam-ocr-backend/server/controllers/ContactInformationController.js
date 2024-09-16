const express = require("express");
const { apiResponse } = require("../utils/index");
const {
  contactInformationValidation,
} = require("../helpers/ContactInformationValidation");
const {
  updateContact,
  fetchContactInfo,
} = require("../repositories/ContactInformationRepository");
const router = express.Router();

exports.updateContactInfo = async (req, res) => {
  try {
    console.log(req.files.image);
    console.log(req.body);
    const { error } = contactInformationValidation(req.body);
    if (error) {
      return apiResponse(req, res, {}, 400, error.details[0].message);
    }

    let image = null;
  
    if (req.files && req.files.image) {
        image = req.files.image;
        console.log('Image file:', image);
      } else {
        console.log('No image file uploaded');
      }

    const result = await updateContact(req.body, image);

    if (result.affectedRows === 0) {
      return apiResponse(
        req,
        res,
        {},
        404,
        "Failed to update contact information"
      );
    }

    return apiResponse(
      req,
      res,
      {},
      200,
      "Contact information updated successfully"
    );
  } catch (err) {
    console.error(err);
    return apiResponse(req, res, {}, 500, "Internal Server Error");
  }
};

exports.getContactInfo = async (req, res) => {
  try {
    const contactInfo = await fetchContactInfo();

    if (!contactInfo) {
      return apiResponse(req, res, {}, 404, "Contact information not found");
    }

    return apiResponse(
      req,
      res,
      contactInfo,
      200,
      "Contact information retrieved successfully"
    );
  } catch (err) {
    console.error(err);
    return apiResponse(req, res, {}, 500, "Internal Server Error");
  }
};
