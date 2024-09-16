const express = require("express");
const router = express.Router();
const { add_slider, edit_slider, list_slider, get_slider, delete_slider } = require("@controllers/sliderController");
const { loginRequired } = require("@base/middleware");

router.route("/addSlider").post(loginRequired, add_slider);
router.route("/updateSlider").post(loginRequired, edit_slider);
router.route("/listSliders").get(list_slider);
router.route("/getSlider").get(loginRequired, get_slider);
router.route("/deleteSlider").delete(loginRequired, delete_slider);

module.exports = router;
