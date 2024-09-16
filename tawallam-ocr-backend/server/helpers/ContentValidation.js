const Joi = require("joi");

function addContentValidation(body) {
  const schema = Joi.object({
    title: Joi.string().required(),
    title_ar: Joi.string().required(),
    // short_description_ar: Joi.string().required(),
    // short_description: Joi.string().required(),
    long_description: Joi.string().required(),
    long_description_ar: Joi.string().required(),
    step_id: Joi.string().required(),
    image: Joi.string().label("File").messages({
      "any.required": "File is required",
    }),
  });
  return schema.validate(body);
}

function editContentValidation(body) {
  const schema = Joi.object({
    id: Joi.number().required(),
    title: Joi.string().required(),
    title_ar: Joi.string().required(),
    short_description_ar: Joi.string().required(),
    short_description: Joi.string().required(),
    long_description: Joi.string().required(),
    long_description_ar: Joi.string().required(),
    // image: Joi.string().label("File").messages({
    //   "any.optional": "File is required",
    // }),
  });
  return schema.validate(body);
}

function getContentValidate(body) {
  const schema = Joi.object({
    id: Joi.number().required(),
  });
  return schema.validate(body);
}

function deleteContentValidation(body) {
  const schema = Joi.object({
    id: Joi.number().required(),
  });
  return schema.validate(body);
}
module.exports = { addContentValidation, editContentValidation, getContentValidate, deleteContentValidation };
