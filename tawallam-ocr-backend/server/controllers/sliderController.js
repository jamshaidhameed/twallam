const { apiResponse } = require("@utils");
const path = require("path");

// const { uploadFile } = require("../utils/index");
const { sliderValidation, editSliderValidation, getSliderValidate, delete_sliderValidation } = require("../helpers/SliderValidation");
const { sliderModel, editSliderModel, listSliderModel, getSliderRepo, delete_sliderModel } = require("../repositories/SliderRepository");
// const { uploadFile, getFileUrl } = require("../utils/index");
const { title } = require("process");

exports.add_slider = async (req, res) => {
  const { error } = sliderValidation(req.body);

  if (error) {
    return apiResponse(req, res, {}, 404, error.details[0].message);
  }

  let uploadedFile = req.files.image;

  // Define the upload path
  const uploadPath = path.join(__dirname, "../../public/uploads", uploadedFile.name);

  uploadedFile.mv(uploadPath, (err) => {
    if (err) {
      console.error("Error while moving the file:", err);
      return res.status(500).send(err);
    }

    return;
  });
  var pages = await sliderModel(req.body, uploadedFile.name);

  if (pages.length === 0) {
    return apiResponse(req, res, {}, 404, "Failed To Add Slider");
  }
  return apiResponse(req, res, {}, 200, "Slider Add Successfully");
};

exports.edit_slider = async (req, res) => {
  const { error } = editSliderValidation(req.body);
  if (error) {
    return apiResponse(req, res, {}, 404, error.details[0].message);
  }
  var uploadedFile = "";
  if (req.files) {
    uploadedFile = req.files.image;
    const updatePath = path.join(__dirname, "../../public/uploads", uploadedFile.name);

    uploadedFile.mv(updatePath, (err) => {
      if (err) {
        console.error("Error while moving the file:", err);
        return res.status(500).send(err);
      }

      return;
    });
  }

  var file = await editSliderModel(req.body, req.files ? uploadedFile.name : "");

  if (file.affectedRows === 0) {
    return apiResponse(req, res, {}, 404, "Failed to Update Page");
  }
  return apiResponse(req, res, {}, 200, "Page Updated Successfully");
};

exports.list_slider = async (req, res) => {
  var list = await listSliderModel();

  if (list.length === 0) {
    return apiResponse(req, res, [], 404, "No Slider List Found.");
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

exports.get_slider = async (req, res) => {
  const payload = req.query;
  const { error } = getSliderValidate(payload);

  if (error) {
    return apiResponse(req, res, {}, 500, error.details[0].message);
  }
  const response = await getSliderRepo(payload);
  if (response.length === 0) {
    return apiResponse(req, res, {}, 404, "Record Not Exist");
  } else {
    const baseURL = process.env.APP_BASE_URL;
    response[0].image = `${baseURL}/public/uploads/${response[0].image}`;
    return apiResponse(req, res, response[0], 200, "Record Found");
  }
};

exports.delete_slider = async (req, res) => {
  const { error } = delete_sliderValidation(req.body);

  if (error) {
    return helpers.apiResponse(req, res, {}, 404, error.details[0].message);
  }
  var remove = await delete_sliderModel(req.body);

  if (remove.affectedRows === 0) {
    return apiResponse(req, res, {}, 404, "Failed to Delete Slider");
  }
  return apiResponse(req, res, {}, 200, "Slider Deleted Successfully");
};
