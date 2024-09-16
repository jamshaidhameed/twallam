const Joi = require("joi");

function addCustomerValidation(body) {
  const schema = Joi.object({
    name: Joi.string().required(),
    type: Joi.string().required(),
    address: Joi.string().required(),
    account_no: Joi.string().label("account_no").optional(),
    phone: Joi.string().label("phone").optional(),
    mobile: Joi.string().label("mobile").optional(),
    vat_number: Joi.string().required(),
  });
  return schema.validate(body);
}
function editCustomerValidation(body) {
  const schema = Joi.object({
    name: Joi.string().required(),
    address: Joi.string().required(),
    account_no: Joi.string().allow("").optional(),
    phone: Joi.string().allow("").optional(),
    mobile: Joi.string().allow("").optional(),
    vat_number: Joi.string().required(),
    id: Joi.number().required(),
  });
  return schema.validate(body);
}
function getCustomerValidation(body) {
  const schema = Joi.object({
    id: Joi.number().required(),
  });
  return schema.validate(body);
}
function deleteCustomerValidation(body) {
  const schema = Joi.object({
    id: Joi.number().required(),
  });
  return schema.validate(body);
}
module.exports = { addCustomerValidation, editCustomerValidation, getCustomerValidation, deleteCustomerValidation };
