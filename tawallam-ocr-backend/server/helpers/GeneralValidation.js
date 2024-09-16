const Joi = require("joi");

function addSettingValidation(body) {
  const schema = Joi.object({
    title: Joi.string().required(),
    email: Joi.string().required(),
    phone: Joi.number().required(),
    address: Joi.string().required(),
    address_ar: Joi.string().required(),
  });
  return schema.validate(body);
}
function editSettingValidation(body) {
  const schema = Joi.object({
    title: Joi.string().required(),
    email: Joi.string().required(),
    phone: Joi.number().required(),
    address: Joi.string().required(),
    address_ar: Joi.string().required(),
    id: Joi.number().required(),
  });
  return schema.validate(body);
}
function getSettingValidation(body) {
  const schema = Joi.object({
    id: Joi.number().required(),
  });
  return schema.validate(body);
}
function deleteSettingValidation(body) {
  const schema = Joi.object({
    id: Joi.number().required(),
  });
  return schema.validate(body);
}
module.exports = { addSettingValidation, editSettingValidation, getSettingValidation, deleteSettingValidation };
