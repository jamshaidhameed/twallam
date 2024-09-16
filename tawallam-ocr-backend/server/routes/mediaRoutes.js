const express = require("express");
const { SocialMedia } = require("../controllers/MediaController");

const router = express.Router();

router.route("/SocialMedia").post(SocialMedia);

module.exports = router;
