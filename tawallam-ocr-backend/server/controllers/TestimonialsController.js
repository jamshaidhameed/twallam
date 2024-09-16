const express = require("express");
const router = express.Router();
const { testimonialValidation, editTestimonialValidation, getTestimonialvalidate, deleteTestimonialValidation } = require("../helpers/TestimonialValidation");
const { testimonialModel, editTestimonialModel, listTestimonialsModel, deleteTestimonialModel, getTestimonialRepo } = require("../repositories/testimonialRepository");
const path = require("path");
const { apiResponse } = require("../utils/index");

exports.addTestimonials = async (req, res) => {
  try {
      // Validate request body
      const { error } = testimonialValidation(req.body);
      if (error) {
          return apiResponse(req, res, {}, 404, error.details[0].message);
      }


      // Get the uploaded file
      let uploadedFile = req.files.image;

      // Define the upload path
      const uploadPath = path.join(__dirname, "../../public/uploads", uploadedFile.name);
      
      // Move the file to the server
      await new Promise((resolve, reject) => {
          uploadedFile.mv(uploadPath, (err) => {
              if (err) {
                  console.error("Error while moving the file:", err);
                  return reject(err);
              }
              resolve();
          });
      });

      // Perform the database operation
      var test = await testimonialModel(req.body, uploadedFile.name);

      // Check the result and send the appropriate response
      if (test.length === 0) {
          return apiResponse(req, res, {}, 404, "Failed To Add Testimonial");
      }

      return apiResponse(req, res, {}, 200, "Testimonial Added Successfully");
  } catch (err) {
      console.error("Error:", err);
      return res.status(500).send(err.message);
  }
};

exports.editTestimonial = async (req, res) => {
  const { error } = editTestimonialValidation(req.body);
  if (error) {
    return apiResponse(req, res, {}, 404, error.details[0].message);
  }
  let uploadedFile = req.files ? req.files.image : null;
  let fileName = null;
  if (uploadedFile) {
    fileName = uploadedFile.name;
    const updatePath = path.join(__dirname, "../../public/uploads", fileName);

    await new Promise((resolve, reject) => {
        uploadedFile.mv(updatePath, (err) => {
            if (err) {
                console.error("Error while moving the file:", err);
                return reject(res.status(500).send(err));
            }
            resolve();
        });
    });
}
  var file = await editTestimonialModel(req.body, fileName);
  if (file.length === 0) {
    return apiResponse(req, res, {}, 404, "Failed to Edit Testimonial");
  }
  return apiResponse(req, res, {}, 200, "Testimonial Edited Successfully");
};

exports.listTestimonials = async (req, res) => {
  const payload = req.query;

  var list = await listTestimonialsModel(payload);

  if (list.length === 0) {

    return apiResponse(req, res, {}, 404, "No Testimonial List Found.");
  }

         const baseURL = process.env.APP_BASE_URL;

         list = list.map(item => {
             if (item.image) {
                 item.image = `${baseURL}/public/uploads/${item.image}`;
             }
             return item;
         });

  return apiResponse(req, res, list, 200, "Success");
};

// exports.listTestimonials = async (req, res) => {
//   const payload = req.query;
//   //   console.log(payload);

//   var Testimonial = await listTestimonialsModel(payload);
//   //   console.log(Testimonial);
//   if (Testimonial.length === 0) {
//     return apiResponse(req, res, {}, 404, "No Testimonial List Found.");
//   }
//   //   console.log(Testimonial);
//   return apiResponse(req, res, list, 200, "Success");
// };

exports.getTestimonial = async (req, res) => {
  const payload = req.query;
  const { error } = getTestimonialvalidate(payload);

  if (error) {
    return apiResponse(req, res, {}, 500, error.details[0].message);
  }
  const response = await getTestimonialRepo(payload);
  console.log(response);
  const baseURL = process.env.APP_BASE_URL;
  response[0].image = `${baseURL}/public/uploads/${response[0].image}`;

  if (response.length === 0) {
    return apiResponse(req, res, [], 200, "Record Not Exist");
  } else {
    return apiResponse(req, res, response, 200, "Record Found");
  }
};

exports.deleteTestimonial = async (req, res) => {
  const { error } = deleteTestimonialValidation(req.body);

  if (error) {
    return helpers.apiResponse(req, res, {}, 404, error.details[0].message);
  }
  var Testimonial = await deleteTestimonialModel(req.body);

  if (Testimonial.length === 0) {
    return apiResponse(req, res, {}, 404, "Failed to Testimonial Delete");
  }
  return apiResponse(req, res, {}, 200, "Testimonial Deleted Successfully");
};
