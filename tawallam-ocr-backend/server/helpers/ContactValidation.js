const Joi = require("joi");

function addContactValidation(body) {
  const schema = Joi.object({
    title: Joi.string().required(),
    lang_id: Joi.number().required(),
    phone: Joi.number().required(),
    email: Joi.string().required(),
    address: Joi.string().required(),
    description: Joi.string().required(),
  });
  return schema.validate(body);
}

function editContactValidation(body) {
  const schema = Joi.object({
    title: Joi.string().required(),
    lang_id: Joi.number().required(),
    phone: Joi.number().required(),
    email: Joi.string().required(),
    address: Joi.string().required(),
    description: Joi.string().required(),
    id: Joi.number().required(),
  });
  return schema.validate(body);
}

function getContactValidation(body) {
  const schema = Joi.object({
    id: Joi.number().required(),
  });
  return schema.validate(body);
}

function deleteContactValidation(body) {
  const schema = Joi.object({
    id: Joi.number().required(),
  });
  return schema.validate(body);
}
function contactUsValidation(body) {
  const schema = Joi.object({
    description: Joi.string().required(),
    userName: Joi.string().required(),
    mobile: Joi.number().required(),
    email: Joi.string().required(),
    date: Joi.string().optional(),
    time: Joi.string().optional(),
    subject: Joi.string().optional(),
  });
  return schema.validate(body);
}
function subscriberValidation(body) {
  const schema = Joi.object({
    email: Joi.string().required(),
  });
  return schema.validate(body);
}

module.exports = { addContactValidation, editContactValidation, getContactValidation, deleteContactValidation, contactUsValidation, subscriberValidation };
