const Joi = require("joi");

function testimonialValidation(body) {
  const schema = Joi.object({
    name: Joi.string().required(),
    name_ar: Joi.string().required(),
    description: Joi.string().required(),
    description_ar: Joi.string().required(),
    image: Joi.string().label("File").messages({
      "any.required": "File is required",
    }),
  });
  return schema.validate(body);
}

function editTestimonialValidation(body) {
  const schema = Joi.object({
    name: Joi.string().required(),
    name_ar: Joi.string().required(),
    description: Joi.string().required(),
    description_ar: Joi.string().required(),
    image: Joi.string().label("File").messages({
      "any.required": "File is required",
    }),
    id: Joi.number().required(),
  });
  return schema.validate(body);
}

function getTestimonialvalidate(body) {
  const schema = Joi.object({
    id: Joi.number().required(),
  });
  return schema.validate(body);
}

function deleteTestimonialValidation(body) {
  const schema = Joi.object({
    id: Joi.number().required(),
  });
  return schema.validate(body);
}
module.exports = {
  testimonialValidation,
  editTestimonialValidation,
  getTestimonialvalidate,
  deleteTestimonialValidation,
};
