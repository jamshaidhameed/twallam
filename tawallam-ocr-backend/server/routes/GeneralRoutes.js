const express = require("express");
const { addSetting, editSetting, getSetting, listSettings, deleteSetting } = require("../controllers/GeneralController");
const router = express.Router();

router.route("/add_Setting").post(addSetting);
router.route("/edit_Setting").post(editSetting);
router.route("/get_Setting").get(getSetting);
router.route("/list_Settings").get(listSettings);
router.route("/delete_Setting").delete(deleteSetting);

module.exports = router;
