const Joi = require("joi");

function addContectContentValidation(body) {
  const schema = Joi.object({
    title: Joi.string().required(),
    description: Joi.string().required(),
  });
  return schema.validate(body);
}

function editContactContentValidation(body) {
  const schema = Joi.object({
    title: Joi.string().required(),
    description: Joi.string().required(),
    id: Joi.number().required(),
  });
  return schema.validate(body);
}

function getContactContentValidation(body) {
  const schema = Joi.object({
    id: Joi.number().required(),
  });
  return schema.validate(body);
}

function deleteContactContentValidation(body) {
  const schema = Joi.object({
    id: Joi.number().required(),
  });
  return schema.validate(body);
}
module.exports = { addContectContentValidation, editContactContentValidation, getContactContentValidation, deleteContactContentValidation };
