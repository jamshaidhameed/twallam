const express = require("express");
const router = express.Router();
const { loginRequired } = require("@base/middleware");
;

const { getCardData, getInvoiceStats } = require("@controllers/DashboardController");

router.route("/CardData").get(loginRequired, getCardData);

router.route("/InvoiceStats").get(loginRequired, getInvoiceStats);

module.exports = router;
