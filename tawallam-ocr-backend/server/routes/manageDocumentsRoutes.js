const express = require("express");
const router = express.Router();
const { loginRequired, validate } = require("@base/middleware");
const { manageDocumentSchema } = require("@base/validation");
const {
  add_document,
  list_document,
  edit_document,
  update_document,
  delete_document,
  updateDocumentStatus
} = require("@controllers/ManageDocumentsController");
const {get_slider} = require("@controllers/sliderController");

router
  .route("/addDocuments")
  .post(validate(manageDocumentSchema), loginRequired, add_document);

router.route("/listDocuments").get(loginRequired, list_document);

router.route("/listDocument/:id").get(loginRequired, edit_document);

router
  .route("/updateDocument/:id")
  .put(validate(manageDocumentSchema), loginRequired, update_document);

router.route("/updateDocumentStatus").post(loginRequired, updateDocumentStatus);

router.route("/deleteDocument/:id").delete(loginRequired, delete_document);

module.exports = router;
