const express = require("express");
const { addTestimonials, editTestimonial, listTestimonials, getTestimonial, deleteTestimonial } = require("../controllers/TestimonialsController");
const router = express.Router();

router.route("/addTestimonial").post(addTestimonials);
router.route("/editTestimonial").post(editTestimonial);
router.route("/listTestimonials").get(listTestimonials);
router.route("/getTestimonial").get(getTestimonial);
router.route("/deleteTestimonial").delete(deleteTestimonial);
module.exports = router;
