const express = require("express");
const { addContact, editContact, listContacts, getContact, deleteContact, contactUs, addSubscriber } = require("../controllers/ContactController");
const router = express.Router();
const { loginRequired, validate } = require("@base/middleware");

router.route("/addContact").post(addContact);
router.route("/editContact").post(editContact);
router.route("/listContacts").get(listContacts);
router.route("/getContact").get(getContact);
router.route("/deleteContact").delete(deleteContact);

router.route("/contactUs").post(contactUs);
router.route("/addSubscriber").post(addSubscriber);

module.exports = router;
