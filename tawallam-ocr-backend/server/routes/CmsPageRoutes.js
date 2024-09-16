const express = require("express");
const { add_CmsPage, editCmsPage, getCmsPage, listCmsPages, deleteCmsPage } = require("../controllers/CmsPageController");
const router = express.Router();

router.route("/addCmsPage").post(add_CmsPage);
router.route("/editCmsPage").post(editCmsPage);
router.route("/getCmsPage").get(getCmsPage);
router.route("/listCmsPages").get(listCmsPages);
router.route("/deleteCmsPage").delete(deleteCmsPage);
module.exports = router;
