const express = require("express");
const router = express.Router();
const { loginRequired, validate } = require("@base/middleware");
const { login } = require("@controllers/AuthController");

const {attachPaymentMethod  } = require("@controllers/UsersController");


router.route("/users/attachPaymentMethod").post(attachPaymentMethod);

module.exports = router;
