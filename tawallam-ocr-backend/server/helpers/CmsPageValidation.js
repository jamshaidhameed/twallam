const Joi = require("joi");

function addCmsPageValidation(body) {
  const schema = Joi.object({
    name: Joi.string().required(),
    name_ar: Joi.string().required(),
    title: Joi.string().required(),
    title_ar: Joi.string().required(),
    long_description: Joi.string().required(),
    long_description_ar: Joi.string().required(),
    section_id: Joi.number().required(),
  });
  return schema.validate(body);
}
function editCmsPageValidation(body) {
  const schema = Joi.object({
    name: Joi.string().required(),
    name_ar: Joi.string().required(),
    title: Joi.string().required(),
    title_ar: Joi.string().required(),
    long_description: Joi.string().required(),
    long_description_ar: Joi.string().required(),
    section_id: Joi.number().required(),
    id: Joi.number().required(),
  });
  return schema.validate(body);
}
function getCmsPageValidation(body) {
  const schema = Joi.object({
    id: Joi.number().required(),
  });
  return schema.validate(body);
}
function deleteCmsPageValidation(body) {
  const schema = Joi.object({
    id: Joi.number().required(),
  });
  return schema.validate(body);
}
module.exports = { addCmsPageValidation, editCmsPageValidation, getCmsPageValidation, deleteCmsPageValidation };
