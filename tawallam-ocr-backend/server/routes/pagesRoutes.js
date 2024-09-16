const express = require("express");
const router = express.Router();
const { loginRequired, validate } = require("@base/middleware");
const { registerSchema, loginSchema, forgetPasswordSchema, resetPasswordSchema } = require("@base/validation");
const { login } = require("@controllers/AuthController");
const { cms_pages, edit_pages, delete_pages, list_pages, get_page, getSectionDetail, getSections } = require("../controllers/PagesController");

router.route("/login").post(validate(loginSchema), login);

router.route("/addPage").post(cms_pages);

router.route("/editPage").post(edit_pages);
router.route("/deletePage").delete(delete_pages);

router.route("/listPages").get(list_pages);

router.route("/getPage").get(get_page);
router.route("/getSectionDetail").get(getSectionDetail);
router.route("/getSections").get(getSections);

module.exports = router;


