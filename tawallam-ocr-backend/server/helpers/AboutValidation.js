const Joi = require("joi");

function manageBannerSchema(body) {
  const schema = Joi.object({
    title: Joi.string().required(),
    long_description_ar: Joi.string().required(),
    long_description: Joi.string().required(),
    id: Joi.optional(),
    step_id: Joi.required(),
    title_ar: Joi.string().required(),
  });
  return schema.validate(body);
}

function getBannerSchema(body) {
  const schema = Joi.object({
    id: Joi.number().required(),
  });
  return schema.validate(body);
}
function getHowWeWorkDetailByIdSchema(body) {
  const schema = Joi.object({
    id: Joi.number().required(),
  });
  return schema.validate(body);
}

function getTeamDetailByIdSchema(body) {
  const schema = Joi.object({
    id: Joi.number().required(),
  });
  return schema.validate(body);
}

function deleteTeamByIdSchema(body) {
  const schema = Joi.object({
    id: Joi.number().required(),
  });
  return schema.validate(body);
}

function manageHowWeWorkSchema(body) {
  const schema = Joi.object({
    title: Joi.string().required(),
    title_ar: Joi.string().required(),
    description_ar: Joi.string().required(),
    description: Joi.string().required(),
    section_title: Joi.string().required(),
    section_title_ar: Joi.string().required(),
    id: Joi.optional(),
  });
  return schema.validate(body);
}

function manageTeamSchema(body) {
  const schema = Joi.object({
    name: Joi.string().required(),
    name_ar: Joi.string().required(),
    designation_ar: Joi.string().required(),
    designation: Joi.string().required(),
    id: Joi.optional(),
  });
  return schema.validate(body);
}

module.exports = { manageBannerSchema, getBannerSchema, manageHowWeWorkSchema, manageTeamSchema, getHowWeWorkDetailByIdSchema, getTeamDetailByIdSchema, deleteTeamByIdSchema };
