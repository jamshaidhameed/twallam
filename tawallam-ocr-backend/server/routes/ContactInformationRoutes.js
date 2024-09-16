const express = require("express");
const router = express.Router();
const { updateContactInfo, getContactInfo } = require("../controllers/ContactInformationController");
const { loginRequired, validate } = require("@base/middleware");

router.route("/updateContactInfo").post(loginRequired, updateContactInfo);
router.route("/listContactDetail").get(getContactInfo);
module.exports = router;