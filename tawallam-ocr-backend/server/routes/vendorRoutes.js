const express = require("express");
const { addVendor, editVendor, getVendor, listVendors, deleteVendor } = require("../controllers/VendorController");
const router = express.Router();

router.route("/addVendor").post(addVendor);
router.route("/editVendor").post(editVendor);
router.route("/getVender").get(getVendor);
router.route("/listVendors").get(listVendors);
router.route("/deleteVendor").delete(deleteVendor);
module.exports = router;
