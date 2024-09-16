const Joi = require("joi");

function pagesValidation(body) {
  const schema = Joi.object({
    // one_name: Joi.string().required(),
    // one_title: Joi.string().required(),
    // one_short_description: Joi.string().required(),
    // one_long_description: Joi.string().required(),
    // two_name: Joi.string().required(),
    // two_title: Joi.string().required(),
    // two_short_description: Joi.string().required(),
    // two_long_description: Joi.string().required(),
    // three_name: Joi.string().required(),
    // three_title: Joi.string().required(),
    // three_short_description: Joi.string().required(),
    // three_long_description: Joi.string().required(),

    name: Joi.string().required(),
    title: Joi.string().required(),
    long_description: Joi.string().required(),
    name_ar: Joi.string().required(),
    title_ar: Joi.string().required(),
    long_description_ar: Joi.string().required(),
    section_id: Joi.string().required(),
    image: Joi.optional().allow(''),

  });

  return schema.validate(body);
}
function editpageValidation(body) {
  const schema = Joi.object({
    name: Joi.string().required(),
    title: Joi.string().required(),
    lang_id: Joi.number().required(),
    short_description: Joi.string().optional(),
    long_description: Joi.string().optional(),
    section_id: Joi.number().required(),
    id: Joi.number().required(),
  });
  return schema.validate(body);
}
function delete_pagesValidation(body) {
  const schema = Joi.object({
    id: Joi.number().required(),
  });
  return schema.validate(body);
}
function getPagelidate(body) {
  const schema = Joi.object({
    id: Joi.number().required(),
  });
  return schema.validate(body);
}

function sectionValidation(body) {
  const schema = Joi.object({
    section_id: Joi.string().required(),
  });
  return schema.validate(body);
}
module.exports = { pagesValidation, editpageValidation, delete_pagesValidation, getPagelidate, sectionValidation };
