const Joi = require("joi");

function sliderValidation(body) {
  const schema = Joi.object({
    title: Joi.string().required(),
    name: Joi.string().required(),
    description_ar: Joi.string().required(),
    description: Joi.string().required(),
    name_ar: Joi.string().required(),
    title_ar: Joi.string().required(),
    image: Joi.string().label("File").messages({
      "any.required": "File is required",
    }),
  });
  return schema.validate(body);
}

function editSliderValidation(body) {
  const schema = Joi.object({
    title: Joi.string().required(),
    name: Joi.string().required(),
    description: Joi.string().required(),
    description_ar: Joi.string().required(),
    name_ar: Joi.string().required(),
    title_ar: Joi.string().required(),
    id: Joi.number().required(),
  });
  return schema.validate(body);
}

function getSliderValidate(body) {
  const schema = Joi.object({
    id: Joi.number().required(),
  });
  return schema.validate(body);
}

function delete_sliderValidation(body) {
  const schema = Joi.object({
    id: Joi.number().required(),
  });
  return schema.validate(body);
}

// function uploadGroupChatFile(user) {
//   const schema = Joi.object({
//     exam_id: Joi.string().required().messages({
//       "any.required": "Exam id is required",
//     }),
//     lecture_id: Joi.string().required().messages({
//       "any.required": "Lecture id is required",
//     }),
//     file: Joi.string().label("File").messages({
//       "any.required": "File is required",
//     }),
//   });

//   return schema.validate(user);
// }

// function editpageValidation(body) {
//   const schema = Joi.object({
//     name: Joi.string().required(),
//     title: Joi.string().required(),
//     lang_id: Joi.number().required(),
//     short_description: Joi.string().optional(),
//     long_description: Joi.string().optional(),
//     section_id: Joi.number().required(),
//     id: Joi.number().required(),
//   });
//   return schema.validate(body);
// }
// function delete_pagesValidation(body) {
//   const schema = Joi.object({
//     id: Joi.number().required(),
//   });
//   return schema.validate(body);
// }
// function getPagelidate(body) {
//   const schema = Joi.object({
//     id: Joi.number().required(),
//   });
//   return schema.validate(body);
// }
module.exports = { sliderValidation, editSliderValidation, getSliderValidate, delete_sliderValidation };
