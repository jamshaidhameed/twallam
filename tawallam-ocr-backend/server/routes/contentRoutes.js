const express = require("express");
const { addContent, editContent, getContent, listContents, deleteContent } = require("../controllers/ContentController");
const router = express.Router();
const { loginRequired } = require("@base/middleware");

router.route("/addContent").post(loginRequired, addContent);
router.route("/updateContent").post(loginRequired, editContent);
router.route("/getContent").get(loginRequired, getContent);
router.route("/listContents").get(listContents);
router.route("/deleteContent").delete(loginRequired, deleteContent);
module.exports = router;
