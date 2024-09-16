const Joi = require("joi");

function addVendorValidation(body) {
  const schema = Joi.object({
    name: Joi.string().required(),
    phone: Joi.number().required(),
    address: Joi.string().required(),
    city: Joi.string().required(),
  });
  return schema.validate(body);
}
function editVendorValidation(body) {
  const schema = Joi.object({
    name: Joi.string().required(),
    phone: Joi.number().required(),
    address: Joi.string().required(),
    city: Joi.string().required(),
    id: Joi.number().required(),
  });
  return schema.validate(body);
}
function getVendorValidation(body) {
  const schema = Joi.object({
    id: Joi.number().required(),
  });
  return schema.validate(body);
}
function deleteVendorValidation(body) {
  const schema = Joi.object({
    id: Joi.number().required(),
  });
  return schema.validate(body);
}
module.exports = { addVendorValidation, editVendorValidation, getVendorValidation, deleteVendorValidation };
