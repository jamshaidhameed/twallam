const { apiResponse } = require("@utils");
const sendEmail = require("../services/mail");
// const {
//     editSubAdminSchema,
// } = require("../../server/validation");
const { subAdminRegisterModel, editSubAdminModel, listUserModel, deleteSubAdminModel, updateSubAdminModel } = require("../repositories/subAdminRepository");
var bcrypt = require("bcryptjs");
const path = require("path");
const fs = require("fs");

exports.editUser = async (req, res) => {
  // const {error} = editSubAdminSchema(req.query);
  //
  // if (error) {
  //     return apiResponse(req, res, {}, 404, error.details[0].message);
  // }
  var user_id = req.query.user_id;

  var user = await editSubAdminModel(user_id);
  delete user[0].password;
  if (user.length === 0) {
    return apiResponse(req, res, {}, 404, "User not found. Please try again.");
  }

  return apiResponse(req, res, user[0], 200, "Success");
};

exports.deleteUser = async (req, res) => {
  var user_id = req.body.user_id;

  var user = await deleteSubAdminModel(user_id);

  if (user.affectedRows > 0) {
    return apiResponse(req, res, {}, 200, "User deleted successfully");
  }

  return apiResponse(req, res, {}, 500, "Something went wrong");
};

exports.listUsers = async (req, res) => {
  const user_parent_id = req.user.parent_id;
  if (!req.body.type) {
    return apiResponse(req, res, {}, 404, "Please provide user type. Please try again.");
  }
  var page = parseInt(req.body.page) || 1;
  var limit = parseInt(req.body.limit) || 10;

  var filter_value = "";
  var filter_key = "";
  if (req.body.type === "company") {
    filter_value = 2;
    filter_key = "role_id";
  } else if (req.body.type === "individual") {
    filter_value = 3;
    filter_key = "role_id";
  } else {
    filter_value = req.user.super_parent_id ?? req.user.user_id;
    filter_key = "super_parent_id";
  }

  const params = {
    page: page,
    limit: limit,
    skip: (page - 1) * limit,
    filter_key: filter_key,
    filter_value: filter_value,
    user_id: req.user.user_id,
  };

  // var user = await listUserModel(req.user.user_id);
  var user = await listUserModel(params);

  if (user.length === 0) {
    return apiResponse(req, res, {}, 404, "Users not found. Please try again.");
  }

  return apiResponse(req, res, user, 200, "Success");
};

exports.addUser = async (req, res) => {
  if (req.body.password) {
    req.body.password = bcrypt.hashSync(req.body.password, 8);
  }

  req.body.parent_id = req.user.user_id;
  req.body.super_parent_id = req.user.super_parent_id || req.user.user_id;

  var user = await subAdminRegisterModel(req.body);

  if (user == "1") {
    return apiResponse(req, res, {}, 404, "Email already exists. Please try again.");
  }

  if (user.length === 0) {
    return apiResponse(req, res, {}, 404, "Failed to add user. Please try again.");
  }
  delete user[0].password;
  return apiResponse(req, res, user[0], 200, "User added successfully");
};

exports.updateUser = async (req, res) => {
  if (req.body.password) {
    req.body.password = bcrypt.hashSync(req.body.password, 8);
  }

  var user = await updateSubAdminModel(req.body);

  if (user.affectedRows > 0) {
    return apiResponse(req, res, {}, 200, "User updated successfully");
  }

  return apiResponse(req, res, {}, 500, "Something went wrong");
};
