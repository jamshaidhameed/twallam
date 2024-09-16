const { apiResponse } = require("@utils");
const axios = require("axios");
const { addAboutBannerModel, getAboutStepsSectionDetailModel, getHowWeWorkDetailModel, addAboutHowWeWorkModel, getTeamListModel, addAboutTeamModel, getHowWeWorkDetailByIdModel, getTeamDetailByIdModel, getAboutStepsSectionDetailByIdModel, deleteTeamModel } = require("../repositories/aboutRepository");
const { manageBannerSchema, getBannerSchema, manageSectionOneSchema, getSectionOneSchema, manageSectionTwoSchema, getSectionTwoSchema, manageHowWeWorkSchema, manageTeamSchema, getHowWeWorkDetailByIdSchema, getTeamDetailByIdSchema, deleteTeamByIdSchema } = require("../helpers/AboutValidation");
const path = require("path");

exports.manageSectionSteps = async (req, res) => {
  const { error } = manageBannerSchema(req.body);

  if (error) {
    return apiResponse(req, res, {}, 404, error.details[0].message);
  }

  //if id then update case and if not id then create case

  // if (req.body.id != undefined) {
  const payload = { id: req.body.step_id };
  const response = await getAboutStepsSectionDetailModel(payload);
  if (response.length > 0) {
    req.body.id = response[0].id;
  }

  if (req.body.id == undefined && !req.files) {
    return apiResponse(req, res, {}, 404, "Image is required");
  }
  let uploadedFile = req.files ? req.files.image : "";
  if (uploadedFile != "") {
    // Define the upload path
    const uploadPath = path.join(__dirname, "../../public/uploads", uploadedFile.name);
    if (req.files.image) {
      uploadedFile.mv(uploadPath, (err) => {
        if (err) {
          console.error("Error while moving the file:", err);
          return res.status(500).send(err);
        }

        return;
      });
    }
  }
  var pages = await addAboutBannerModel(req.body, uploadedFile.name || "");
  let msg = "Add";
  if (req.body.id != undefined) msg = "Updated";
  if (pages.length === 0) {
    return apiResponse(req, res, {}, 404, `Failed To ${msg} Section`);
  }
  return apiResponse(req, res, {}, 200, `Section ${msg} Successfully`);
};

exports.getSectionStepsDetail = async (req, res) => {
  const payload = req.query;
  const { error } = getBannerSchema(payload);

  if (error) {
    return apiResponse(req, res, {}, 500, error.details[0].message);
  }
  const response = await getAboutStepsSectionDetailModel(payload);
  if (response.length === 0) {
    return apiResponse(req, res, {}, 404, "Record Not Exist");
  } else {
    const baseURL = process.env.APP_BASE_URL;
    response[0].image = `${baseURL}/public/uploads/${response[0].image}`;
    return apiResponse(req, res, response[0], 200, "Record Found");
  }
};

exports.manageHowWeWork = async (req, res) => {
  const { error } = manageHowWeWorkSchema(req.body);

  if (error) {
    return apiResponse(req, res, {}, 404, error.details[0].message);
  }

  if (req.body.id != undefined) {
    const response = await getHowWeWorkDetailByIdModel(req.body);
    if (response.length === 0) {
      return apiResponse(req, res, {}, 404, "Record Not Exist");
    }
  }

  var pages = await addAboutHowWeWorkModel(req.body);
  let msg = "Add";
  if (req.body.id != undefined) msg = "Updated";
  if (pages.length === 0) {
    return apiResponse(req, res, {}, 404, `Failed To ${msg} How We Work Section`);
  }

  return apiResponse(req, res, {}, 200, `How We Work Section ${msg} Successfully`);
};

exports.getHowWeWorkList = async (req, res) => {
  const response = await getHowWeWorkDetailModel();
  if (response.length === 0) {
    return apiResponse(req, res, {}, 404, "Record Not Exist");
  } else {
    return apiResponse(req, res, response, 200, "Record Found");
  }
};
exports.getTeamList = async (req, res) => {
  const response = await getTeamListModel();
  if (response.length === 0) {
    return apiResponse(req, res, {}, 404, "Record Not Exist");
  } else {
    const baseURL = process.env.APP_BASE_URL;
    for (let i = 0; i < response.length; i++) {
      response[i].image = `${baseURL}/public/uploads/${response[i].image}`;
    }

    return apiResponse(req, res, response, 200, "Record Found");
  }
};

exports.manageTeam = async (req, res) => {
  const { error } = manageTeamSchema(req.body);

  if (error) {
    return apiResponse(req, res, {}, 404, error.details[0].message);
  }

  if (req.body.id != undefined) {
    const response = await getTeamDetailByIdModel(req.body);
    if (response.length === 0) {
      return apiResponse(req, res, {}, 404, "Record Not Exist");
    }
  }

  if (req.body.id == undefined && !req.files) {
    return apiResponse(req, res, {}, 404, "Image is required");
  }
  let uploadedFile = req.files ? req.files.image : "";
  if (uploadedFile != "") {
    // Define the upload path
    const uploadPath = path.join(__dirname, "../../public/uploads", uploadedFile.name);
    if (req.files.image) {
      uploadedFile.mv(uploadPath, (err) => {
        if (err) {
          console.error("Error while moving the file:", err);
          return res.status(500).send(err);
        }

        return;
      });
    }
  }
  var pages = await addAboutTeamModel(req.body, uploadedFile.name || "");
  let msg = "Add";
  if (req.body.id != undefined) msg = "Updated";
  if (pages.length === 0) {
    return apiResponse(req, res, {}, 404, `Failed To ${msg} Teams`);
  }
  return apiResponse(req, res, {}, 200, `Teams ${msg} Successfully`);
};

exports.getHowWeWorkDetail = async (req, res) => {
  const payload = req.query;
  const { error } = getHowWeWorkDetailByIdSchema(payload);

  if (error) {
    return apiResponse(req, res, {}, 500, error.details[0].message);
  }
  const response = await getHowWeWorkDetailByIdModel(req.query);
  if (response.length === 0) {
    return apiResponse(req, res, {}, 404, "Record Not Exist");
  } else {
    return apiResponse(req, res, response[0], 200, "Record Found");
  }
};

exports.teamDetail = async (req, res) => {
  const payload = req.query;
  const { error } = getTeamDetailByIdSchema(payload);

  if (error) {
    return apiResponse(req, res, {}, 500, error.details[0].message);
  }
  const response = await getTeamDetailByIdModel(payload);
  if (response.length === 0) {
    return apiResponse(req, res, {}, 404, "Record Not Exist");
  } else {
    const baseURL = process.env.APP_BASE_URL;
    response[0].image = `${baseURL}/public/uploads/${response[0].image}`;
    return apiResponse(req, res, response[0], 200, "Record Found");
  }
};

exports.deleteTeam = async (req, res) => {
  const { error } = deleteTeamByIdSchema(req.body);

  if (error) {
    return apiResponse(req, res, {}, 404, error.details[0].message);
  }

  const response = await getTeamDetailByIdModel(req.body);

  if (response.length === 0) {
    return apiResponse(req, res, {}, 404, "Record Not Exist");
  }

  var team = await deleteTeamModel(req.body);

  if (team.affectedRows === 0) {
    return apiResponse(req, res, {}, 404, "Failed to Delete Team");
  }
  return apiResponse(req, res, {}, 200, "Team Deleted Successfully");
};
