const express = require("express");
const router = express.Router();
const path = require("path");
const { apiResponse } = require("../utils/index");
const { addContentValidation, editContentValidation, getContentValidate, deleteContentValidation } = require("../helpers/ContentValidation");
const { addcontentModel, editContentModel, getContentRepo, listContentsModel, deleteContentModel, ContentModel } = require("../repositories/ContentRepository");
const {uploadFile} = require("@helpers/helpers");

exports.addContent = async (req, res) => {

  console.log('body',req.body)
  console.log('req.files,', req.files);

  const { error } = addContentValidation(req.body);
  if (error) {
    return apiResponse(req, res, {}, 404, error.details[0].message);
  }
  let file_uploaded = null;

  // let uploadedFile = req.files.image;

  if (req.files !== undefined && req.files !== null){
    file_uploaded = await uploadFile(req.files.image,'public/uploads', null);
  }

  // const uploadPath = path.join(__dirname, "../../public/uploads", uploadedFile.name);
  //
  // uploadedFile.mv(uploadPath, (err) => {
  //   if (err) {
  //     console.error("Error while moving the file.", err);
  //     return res.status(500).send(err);
  //   }
  //   return;
  // });
  // var content = await addcontentModel(req.body, uploadedFile.name);
  var content = await ContentModel(req.body, file_uploaded);

  if (content.length === 0) {
    return apiResponse(req, res, {}, 404, "Failed to add Home Content");
  }
  return apiResponse(req, res, {}, 200, "Home Content Add Successfully Added");
};

exports.editContent = async (req, res) => {
  const { error } = editContentValidation(req.body);
  if (error) {
    return helpers.apiResponse(req, res, {}, 404, error.details[0].message);
  }
  let uploadedFile = req.files ? req.files.image : null;
  let fileName = null;
  if (uploadedFile) {
    fileName = uploadedFile.name;
    //   console.log(uploadFile);

    // Define the upload path
    const updatePath = path.join(__dirname, "../../public/uploads", uploadedFile.name);
    //   console.log(uploadPath);
    // Use the mv() method to place the file somewhere on your server
    uploadedFile.mv(updatePath, (err) => {
      if (err) {
        console.error("Error while moving the file:", err);
        return res.status(500).send(err);
      }

      return;
      // res.send("File uploaded!");
    });
  }
  var file = await editContentModel(req.body, req.files ? uploadedFile.name : "");
  //   var Edit = await editpageModel(req.body);
  //   console.log(req.body);
  if (file.length === 0) {
    return apiResponse(req, res, {}, 404, "Failed to Edit Home Content");
  }
  return apiResponse(req, res, {}, 200, "Home Content Edited Successfully");
};

exports.getContent = async (req, res) => {
  const payload = req.query;
  console.log('payload get',payload)
  const { error } = getContentValidate(payload);

  if (error) {
    return apiResponse(req, res, {}, 500, error.details[0].message);
  }
  const response = await getContentRepo(payload);
  if (response.length === 0) {
    return apiResponse(req, res, {}, 200, "Record Not Exist");
  } else {
    const baseURL = process.env.APP_BASE_URL;
    response[0].image = `${baseURL}/public/uploads/${response[0].image}`;
    return apiResponse(req, res, response[0], 200, "Record Found");
  }
};

exports.listContents = async (req, res) => {
  const payload = req.query;

  var list = await listContentsModel(payload);

  if (list.length === 0) {
    return apiResponse(req, res, [], 404, "No Contents List Found.");
  }
  const baseURL = process.env.APP_BASE_URL;
  list = list.map((item) => {
    if (item.image) {
      item.image = `${baseURL}/public/uploads/${item.image}`;
    }
    return item;
  });
  return apiResponse(req, res, list, 200, "Success");
};
exports.deleteContent = async (req, res) => {
  const { error } = deleteContentValidation(req.body);

  if (error) {
    return apiResponse(req, res, {}, 404, error.details[0].message);
  }
  var content = await deleteContentModel(req.body);

  if (content.length === 0) {
    return apiResponse(req, res, {}, 404, "Failed to Content Delete");
  }
  return apiResponse(req, res, {}, 404, "Content Deleted Successfully");
};
