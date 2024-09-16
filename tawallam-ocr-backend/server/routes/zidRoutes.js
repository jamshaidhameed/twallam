const express = require("express");
const router = express.Router();
const { redirectToZid, zidAuthCallback } = require("@controllers/ZidController");
const { loginRequired } = require("@base/middleware");

router.route('/').get(redirectToZid);
router.route('/callback').get(zidAuthCallback);

module.exports = router;
