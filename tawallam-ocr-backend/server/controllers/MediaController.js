const { apiResponse } = require("@utils");
const { mediaValidation } = require("../helpers/mediaValidation");
const { mediaModel } = require("../repositories/MediaRepository");
exports.SocialMedia = async (req, res) => {
  //   console.log("page");
  const { error } = mediaValidation(req.body);
  if (error) {
    return helpers.apiResponse(req, res, {}, 404, error.details[0].message);
  }
  var Social = await mediaModel(req.body);

  if (Social.length === 0) {
    return apiResponse(req, res, {}, 404, "Failed To update Social Media");
  }
  return apiResponse(req, res, {}, 200, "Social Media updated Successfully");
};
