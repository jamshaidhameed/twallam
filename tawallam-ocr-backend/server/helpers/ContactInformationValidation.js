const Joi = require('joi');

function contactInformationValidation(body) {
  const schema = Joi.object({
    name: Joi.string().max(255).required(),
    name_ar: Joi.string().max(255).required(),
    title: Joi.string().max(255).required(),
    title_ar: Joi.string().max(255).required(),
    description: Joi.string().required(), 
    description_ar: Joi.string().required(), 
    phone_number_title: Joi.string().max(255).required(),
    phone_number_title_ar: Joi.string().max(255).required(), 
    phone_number_value: Joi.string().max(20).required(), 
    email_title: Joi.string().max(255).required(), 
    email_title_ar: Joi.string().max(255).required(),
    email_value: Joi.string().email().max(255).required(), 
    address_title: Joi.string().max(255).required(), 
    address_title_ar: Joi.string().max(255).required(), 
    address_value: Joi.string().required(),
    address_value_ar: Joi.string().required(),
    id: Joi.number().required(),
  });

  return schema.validate(body);
}

module.exports = { contactInformationValidation };
