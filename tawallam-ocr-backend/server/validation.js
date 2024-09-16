const Joi = require("joi");
const config = require("@config");
const { times } = require("lodash");

const { passwordPolicy } = config;

const validate = (data, schema, opts = {}) => {
  if (!opts) opts = {};
  const { error, value } = schema.validate(data, {
    abortEarly: true,
    convert: true,
    ...opts,
  });

  if (error) return { error: error.details.map((detail) => detail.message), value };

  return { error, value };
};

const registerSchema = {
  // name: Joi.string().label("name").required(),
  // type: Joi.string().label("type").required(),
  company_name: Joi.string().label("company_name").optional().allow(""),
  email: Joi.string().label("email").required(),
  password: Joi.string().label("password").required(),
  confirm_password: Joi.string().label("confirm password").required(),
  // address: Joi.string().label("address").required(),
  // city: Joi.string().label("city").required(),
  // phone: Joi.string().label("phone").required(),
  // country: Joi.string().label("country").required(),
  // postal_code: Joi.string().label("postal_code").required(),
};

const loginSchema = {
  email: Joi.string().label("Email").required(),
  password: Joi.string().label("Password").required(),
};

const forgetPasswordSchema = {
  email: Joi.string().label("email").required(),
};

const resetPasswordSchema = {
  new_password: Joi.string().label("new_password").required(),
  confirm_password: Joi.string().label("confirm_password").required(),
  token: Joi.string().label("token").required(),
};

const updateUserPasswordSchema = {
  currentPassword: Joi.string().label("currentPassword").required(),
  newPassword: Joi.string().label("newPassword").required(),
};

const updateProfileSchema = {
  name: Joi.string().label("Name").optional().allow(""),
  phone: Joi.number().label("Phone").optional().allow(""),
  country: Joi.number().label("Country").optional().allow(""),
  password: Joi.string()
    .min(6)
    .pattern(new RegExp(passwordPolicy.rule))
    .label("Password")
    .messages({
      "string.min": passwordPolicy.min,
      "string.pattern.base": passwordPolicy.message,
    })
    .optional()
    .allow(""),
};

const countriesSchema = {
  name: Joi.string().label("Name").required(),
  code: Joi.string().label("Code"),
  start_tax_day: Joi.number().label("start_tax_day").required(),
  end_tax_day: Joi.number().label("end_tax_day").required(),
  start_tax_month: Joi.number().label("start_tax_month").required(),
  end_tax_month: Joi.number().label("end_tax_month").required(),
  allowed_days: Joi.number().label("allowed_days").required(),
  status: Joi.boolean().label("status").required(),
};

const verifyOTPSchema = {
  otp: Joi.string().label("otp").required(),
};

const cancelSubscriptionSchema = {
  cancel_at_period_end: Joi.boolean().label("cancel_at_period_end").optional(),
};

const updatePasswordSchema = {
  password: Joi.string().label("password").required(),
  new_password: Joi.string().label("new_password").required(),
};

const attachPaymentMethodSchema = {
  source: Joi.string().label("source").required(),
};

const configurationsSchema = {
  account_trial_days: Joi.number().label("account_trial_days").required(),
  subscription_on_register: Joi.boolean().label("subscription_on_register").required(),
};

const addSubAdminSchema = {
  name: Joi.string().label("name").required(),
  role_id: Joi.number().label("role_id").required(),
  email: Joi.string().label("email").required(),
  password: Joi.string().label("password").required(),
  address: Joi.string().label("address").required(),
  city: Joi.string().label("city").required(),
  status: Joi.number().label("status").required(),
  phone: Joi.string().label("phone").required(),
  postal_code: Joi.string().label("postal_code").required(),
};

const updateSubAdminSchema = {
  name: Joi.string().label("name").required(),
  role_id: Joi.string().label("role_id").required(),
  email: Joi.string().label("email").required(),
  password: Joi.string().label("password").optional().allow(""),
  address: Joi.string().label("address").required(),
  status: Joi.number().label("status").required(),
  city: Joi.string().label("city").required(),
  phone: Joi.string().label("phone").required(),
  postal_code: Joi.string().label("postal_code").required(),
  user_id: Joi.required(),
};

const editSubAdminSchema = {
  user_id: Joi.required(),
};

const deleteSubAdminSchema = {
  user_id: Joi.required(),
};

const subscriptionSchema = {
  title: Joi.string().label("title").required(),
  description: Joi.string().label("description").required(),
  users: Joi.number().label("users").required(),
  duration: Joi.string().label("duration").required(),
};

const updateSubscriptionSchema = {
  id: Joi.number().label("id").required(),
  title: Joi.string().label("title").required(),
  description: Joi.string().label("description").required(),
  duration: Joi.string().label("duration").required(),
};

const addPermissionSchema = {
  data: Joi.object().label("Data").required(),
  role_name: Joi.string().label("Role name").required(),
  // module_id: Joi.number().label("Module id").required(),
};

const updatePermissionSchema = {
  data: Joi.object().label("Data").required(),
  role_name: Joi.string().label("Role name").required(),
  role_id: Joi.number().label("role_id").required(),
};
const changeStatusSchema = {
  status: Joi.number().label("status").required(),
  user_id: Joi.required(),
};
const deletePermissionSchema = {
  role_id: Joi.number().label("role_id").required(),
};
const addInvoiceSchema = {
  delivery_date: Joi.string().label("delivery_date").optional().allow(""),
  customer_id: Joi.optional(),
  invoice_date: Joi.string().label("invoice_date").required(),
  type: Joi.string().label("type").required(),
  invoice_number: Joi.string().label("invoice_number").required(),
  total_vat: Joi.number().label("total_vat").required(),
  total_vat: Joi.number().label("total_vat").required(),
  invoice_vat_amount: Joi.number().label("invoice_vat_amount").required().precision(10),
  invoice_discount_amount: Joi.number().label("invoice_discount_amount").required().precision(10),
  prepared_by: Joi.string().label("prepared_by").optional().allow(""),
  received_by: Joi.string().label("received_by").optional().allow(""),
  total_amount: Joi.number().label("total_amount").required(),
  sub_total_amount: Joi.number().label("sub_total_amount").required(),
  po_number: Joi.optional().allow(""),
  total_discount: Joi.required(),
  payment_status: Joi.string().label("payment_status").required(),
  payment_mode: Joi.string().label("payment_mode").optional().allow(""),
  // invoice_details: Joi.array().label("invoice_details").required(),
  paid_to: Joi.string().label("paid_to").optional(),
  paid_from: Joi.string().label("paid_from").required(),
};

const updateInvoiceSchema = {
  delivery_date: Joi.string().label("delivery_date").optional().allow(""),
  customer_id: Joi.optional(),
  id: Joi.required(),
  invoice_date: Joi.string().label("invoice_date").required(),
  invoice_vat_amount: Joi.number().label("invoice_vat_amount").required().precision(10),
  invoice_discount_amount: Joi.number().label("invoice_discount_amount").required().precision(10),
  invoice_number: Joi.string().label("invoice_number").required(),
  total_vat: Joi.number().label("total_vat").required(),
  po_number: Joi.optional().allow(""),
  total_discount: Joi.required(),
  prepared_by: Joi.string().label("prepared_by").optional().allow(""),
  received_by: Joi.string().label("received_by").optional().allow(""),
  total_amount: Joi.number().label("total_amount").required(),
  sub_total_amount: Joi.number().label("sub_total_amount").required(),
  payment_status: Joi.string().label("payment_status").required(),
  payment_mode: Joi.string().label("payment_mode").optional().allow(""),
  // invoice_details: Joi.array().label("invoice_details").required(),
  paid_to: Joi.string().label("paid_to").optional(),
  paid_from: Joi.string().label("paid_from").required(),
};

const deleteInvoiceSchema = {
  id: Joi.required(),
};

const resendOtpSchema = {
  name: Joi.string().label("name").required(),
  email: Joi.string().label("email").required(),
};

const manageDocumentSchema = {
  title: Joi.string().label("title").required(),
};
const generalLedgerReportSchema = {
  to_date: Joi.string().label("to_date").required(),
  from_date: Joi.string().label("from_date").required(),
};

module.exports = {
  validate,
  registerSchema: Joi.object(registerSchema),
  loginSchema: Joi.object(loginSchema),
  forgetPasswordSchema: Joi.object(forgetPasswordSchema),
  verifyOTPValidation: Joi.object(verifyOTPSchema),
  resetPasswordSchema: Joi.object(resetPasswordSchema),
  updateProfileSchema: Joi.object(updateProfileSchema),
  addSubAdminSchema: Joi.object(addSubAdminSchema),
  updateSubAdminSchema: Joi.object(updateSubAdminSchema),
  deleteSubAdminSchema: Joi.object(deleteSubAdminSchema),
  updateUserPasswordSchema: Joi.object(updateUserPasswordSchema),
  addSubscription: Joi.object(subscriptionSchema),
  updateSubscription: Joi.object(updateSubscriptionSchema),
  addPermissionSchema: Joi.object(addPermissionSchema),
  changeStatusSchema: Joi.object(changeStatusSchema),
  updatePermissionSchema: Joi.object(updatePermissionSchema),
  deletePermissionSchema: Joi.object(deletePermissionSchema),
  addInvoiceSchema: Joi.object(addInvoiceSchema),
  updateInvoiceSchema: Joi.object(updateInvoiceSchema),
  deleteInvoiceSchema: Joi.object(deleteInvoiceSchema),
  resendOTPValidation: Joi.object(resendOtpSchema),
  manageDocumentSchema: Joi.object(manageDocumentSchema),
  generalLedgerReportSchema: Joi.object(generalLedgerReportSchema),
};
