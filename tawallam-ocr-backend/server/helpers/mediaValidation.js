const Joi = require("joi");

function mediaValidation(body) {
  const schema = Joi.object({
    id: Joi.number().required(),
    MediaLink: Joi.string().required(),
  });
  return schema.validate(body);
}
module.exports = { mediaValidation };
