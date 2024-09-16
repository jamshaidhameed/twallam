const express = require("express");
const { addContectContent, editContactContent, listContactContent, getContactContent, deleteContactContent } = require("../controllers/CContentController");
const router = express.Router();

router.route("/addContactContent").post(addContectContent);
router.route("/editContactContent").post(editContactContent);
router.route("/listContactContent").get(listContactContent);
router.route("/getContactContent").get(getContactContent);
router.route("/deleteContactContent").delete(deleteContactContent);
module.exports = router;
