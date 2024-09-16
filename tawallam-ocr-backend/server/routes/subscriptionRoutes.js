const express = require("express");
const router = express.Router();
const { loginRequired, validate } = require("@base/middleware");
const { login } = require("@controllers/AuthController");
const { subscriptionList } = require("@controllers/SubscriptionController");

const { subscriptionPackageList, addSubscriptionPackage, updateSubscriptionPackage, deleteSubscriptionPackage, getSubscriptionPackage, updateSubscriptionType } = require("@controllers/SubscriptionController");

router.route("/subscriptionPackageList").post(subscriptionPackageList);
router.route("/addSubscriptionPackage").post(addSubscriptionPackage);
router.route("/updateSubscriptionPackage").post(updateSubscriptionPackage);
router.route("/getSubscriptionPackage").get(getSubscriptionPackage);
router.route("/deleteSubscriptionPackage").delete(deleteSubscriptionPackage);
router.route("/updateSubscriptionType").post(updateSubscriptionType);

module.exports = router;
