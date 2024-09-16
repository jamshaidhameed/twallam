const express = require("express");
const { addCustomer, editCustomer, getCustomer, listCustomers, deleteCustomer } = require("../controllers/CustomerController");
const router = express.Router();
const { loginRequired, validate, userTokenMiddleware } = require("@base/middleware");

router.route("/addCustomer").post(loginRequired, addCustomer);
router.route("/updateCustomer").post(loginRequired, editCustomer);
router.route("/getCustomer").get(loginRequired, getCustomer);
router.route("/listCustomers").get(loginRequired, listCustomers);
router.route("/deleteCustomer").delete(loginRequired, deleteCustomer);
module.exports = router;
