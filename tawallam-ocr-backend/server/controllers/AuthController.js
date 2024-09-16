const { apiResponse } = require("@utils");
const sendEmail = require("../services/mail");
const axios = require("axios");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
//const {registerModel} = require("@repositories/authRepository");
const { registerModel, loginModel, addSessionModel, forgetPasswordModel, deleteOTPCodeModel, addOtpModel, matchOtpModel, matchOtpUserIdModel, updatePasswordModel, getSuperAdminModel, getParentRoleModel, getUserProfileModel, updateUserPasswordModel, updateUserProfileModel, getSuperRoleIdModel, changeStatusModel, updateUserOtp, matchSignUpOtpModel, getModulePermissions, isUserSubscribePackage, updateGoogleToken, createGoogleLoginUser } = require("../repositories/authRepository");
var bcrypt = require("bcryptjs");
const path = require("path");
const { createErpNextCompany, getSixDigitCode } = require("../helpers/helpers");
const fs = require("fs");
const { editSubAdminModel, deleteSubAdminModel } = require("../repositories/subAdminRepository");

const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client();

const baseURL = process.env.ERP_BASE_URL;
const apiErpKey = process.env.ERP_APIKEY;
const apiErpSecret = process.env.ERP_APISECRET;

exports.login = async (req, res) => {
  const { email, password } = req.body;

  console.log("req.body", req.body);
  var user = await loginModel(email);

  if (user.length === 0) {
    return apiResponse(req, res, {}, 404, "Invalid email or password. Please try again.");
  }
  user = user[0];
  if (user.status === 0) {
    return apiResponse(req, res, {}, 404, "Inactive user.");
  } else {
    if (user.super_parent_id !== null) {
      var super_user = await editSubAdminModel(user.super_parent_id);

      if (super_user[0].status === 0) {
        return apiResponse(req, res, {}, 404, "Inactive user.");
      }
    }
  }

  // if (!(user.role_id == 1 || user.super_parent_id === 1)) {
  //   var check_user_subscriber = await isUserSubscribePackage(user.super_parent_id || user.id);
  //   if (!check_user_subscriber) {
  //     return apiResponse(req, res, {}, 404, "Please purchase subscription.");
  //   }
  // }

  const passwordIsValid = bcrypt.compareSync(password, user.password);

  if (!passwordIsValid) {
    return apiResponse(req, res, {}, 404, "Invalid email or password. Please try again.");
  }
  user.parent_role_id = null;
  user.super_parent_role_id = null;
  if (user.parent_id != null) {
    var user_parent_id = await getParentRoleModel(user.parent_id);
    user.parent_role_id = user_parent_id.role_id;

    var getSuperRoleId = await getSuperRoleIdModel(user.super_parent_id);
    user.super_parent_role_id = getSuperRoleId.role_id;
  }

  var getModulePermission = await getModulePermissions(user.role_id);
  user.permissions = getModulePermission;
  var token = "";
  token = jwt.sign(
    {
      user_id: user.id,
      email: user.email,
      role_id: user.role_id,
      parent_id: user.parent_id,
      super_parent_id: user.super_parent_id,
      super_parent_role_id: user.super_parent_role_id,
      company_name: user.erpnext_company_name,
      company_abbr: user.erpnext_company_abbr,
      zid_access_token: user.zid_access_token,
      zid_refresh_token: user.zid_refresh_token,
      zid_authorization_token: user.authorization_token,
    },
    process.env.JWT_SECRET
  );

  user.ACCESS_TOKEN = token;
  delete user.password;
  var store_user_token = await addSessionModel(token, user.id);
  if (store_user_token.affectedRows > 0) {
    return apiResponse(req, res, user, 200, "User logged in successfully");
  }
};

exports.register = async (req, res) => {
  console.log("register", req.body);
  const { password, confirm_password } = req.body;

  if (password !== confirm_password) {
    return apiResponse(req, res, {}, 404, "Password does not match. Please try again.");
  }

  if (req.body.password) {
    req.body.password = bcrypt.hashSync(req.body.password, 8);
  }

  if (req.body.type === "company") {
    if (!req.body.company_name || req.body.company_name == "") {
      return apiResponse(req, res, {}, 404, "Company Name has invalid value. Please try again.");
    }
  }

  if (req.body.type === "individual") {
    req.body.role_id = 3;
    // req.body.company_name = null;
  } else {
    req.body.role_id = 2;
  }

  const customer = await stripe.customers.create({
    name: req.body.name,
    email: req.body.email,
  });
  var customer_id = customer.id;

  var user = await registerModel(req.body, customer_id);
  if (user == "1") {
    return apiResponse(req, res, {}, 404, "Email already exists. Please try again.");
  }
  // console.log(user);
  var erpCompanyResponse;
  if (user != "1") {
    try {
      erpCompanyResponse = await createErpNextCompany(req, res, user);
    } catch (error) {
      if (error.response) {
        console.error("Error creating ERP Next company:", error.response.data);
        return apiResponse(req, res, error.response.data, 404, "Failed to add in Erp next");
      } else {
        console.error("Error creating ERP Next company:", error.message);
        return apiResponse(req, res, error.message, 404, "Failed to add in Erp next");
      }
    }
  }
  var token = "";
  token = jwt.sign(
    {
      user_id: user[0].id,
      email: user[0].email,
      role_id: user[0].role_id,
      parent_id: user[0].parent_id,
      super_parent_id: user[0].super_parent_id,
      company_name: user != "1" ? erpCompanyResponse.name : "",
      company_abbr: user != "1" ? erpCompanyResponse.abbr : "",
    },
    process.env.JWT_SECRET
  );

  user[0].ACCESS_TOKEN = token;
  delete user.password;

  // var store_user_token = await addSessionModel(token, user[0].id);

  if (user.length === 0) {
    return apiResponse(req, res, {}, 404, "Failed to add user. Please try again.");
  }
  delete user[0].password;
  var super_admin_user = await getSuperAdminModel();
  //
  // if (super_admin_user.length > 0) {
  //     const {name} = user[0];
  //     const {email} = super_admin_user[0];
  //     const user_email = user[0].email;
  //     const super_admin_name = super_admin_user[0].name;
  //     const options = {
  //         name,
  //         email,
  //         super_admin_name,
  //         user_email,
  //         subject: "Notification of New User Registration",
  //         file_name: "user_register",
  //     };
  //
  //     const mail_sent = await sendEmail(options);
  // }

  let otp_code = Math.floor(100000 + Math.random() * 900000);

  user = user[0];
  const { name, email } = user;
  const options = {
    name,
    email: email,
    subject: "Four Digit Code",
    file_name: "send_otp",
    otp_code,
  };

  const mail_sent = await sendEmail(options);

  if (mail_sent == false) {
    return apiResponse(req, res, {}, 404, "Failed to send email. Please try again.");
  } else {
    var saveOtp = await updateUserOtp(otp_code, user.id);
    if (saveOtp) {
      return apiResponse(req, res, user, 200, "Email sent successfully");
    }
    if (saveOtp.length === 0) {
      return apiResponse(req, res, {}, 404, "Something went wrong. Please try again.");
    }
  }

  return apiResponse(req, res, user, 200, "User added successfully");
};

exports.forgetPassword = async (req, res) => {
  const { email } = req.body;
  var user = await forgetPasswordModel(email);

  if (user.length === 0) {
    return apiResponse(req, res, {}, 404, "Email does not exist. Please try again.");
  }
  user = user[0];
  await deleteOTPCodeModel(user.id);

  let otp_code = Math.floor(100000 + Math.random() * 900000);
  // let subject = "Forget Password";
  // var html = "otp.html";
  // const htmlFilePath = path.join("mail", html);
  // let htmlContent = fs.readFileSync(htmlFilePath, "utf8");
  // let htmll = htmlContent.replace("{USER_NAME}", user.name).replace("{OTP_CODE}", otp);
  //
  const { name } = user;
  const options = {
    name,
    email,
    subject: "Forget Password",
    file_name: "forgot_password",
    otp_code,
  };

  const mail_sent = await sendEmail(options);

  if (mail_sent == false) {
    return apiResponse(req, res, {}, 404, "Failed to send email. Please try again.");
  } else {
    var saveToken = await addOtpModel(otp_code, user.id);
    if (saveToken) {
      return apiResponse(req, res, {}, 200, "Email sent successfully");
    }
    if (saveToken.length === 0) {
      return apiResponse(req, res, {}, 404, "Something went wrong. Please try again.");
    }
  }
};

exports.verifyOTP = async (req, res) => {
  const { otp } = req.body;

  var is_valid_user = await matchOtpModel(otp);

  if (is_valid_user === "1") {
    return apiResponse(req, res, {}, 404, "OTP is not valid. Please try again.");
  }

  if (is_valid_user === "2") {
    return apiResponse(req, res, {}, 404, "OTP is expired. Please try again.");
  }

  var token = jwt.sign(
    {
      user_id: is_valid_user[0].user_id,
    },
    process.env.JWT_SECRET
  );

  return apiResponse(req, res, { token: token }, 200, "OTP is valid");
};

exports.resetPassword = async (req, res) => {
  const { new_password, confirm_password, token } = req.body;

  userObj = jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      console.error("JWT verification failed:", err.message);
      return apiResponse(req, res, {}, 404, "Invalid OTP. Please try again.");
      // Handle verification failure
    } else {
      return decoded;
      // Use the decoded payload as needed
    }
  });

  var user_id = userObj.user_id;

  var valid_token = await matchOtpUserIdModel(user_id);
  if (valid_token === "1") {
    return apiResponse(req, res, {}, 404, "OTP is not valid. Please try again.");
  }

  if (new_password != confirm_password) {
    return apiResponse(req, res, {}, 404, "Password does not match. Please try again.");
  }

  var user = await updatePasswordModel(bcrypt.hashSync(req.body.new_password, 8), user_id);

  if (user.affectedRows == 0) {
    return apiResponse(req, res, {}, 404, "Failed to update password. Please try again.");
  }

  await deleteOTPCodeModel(user_id);
  return apiResponse(req, res, {}, 200, "Password updated successfully");
};

exports.getProfileDetail = async (req, res) => {
  var user_id = req.user.user_id;

  var user = await getUserProfileModel(user_id);

  if (user.length === 0) {
    return apiResponse(req, res, {}, 404, "User not found. Please try again.");
  }
  user = user[0];
  delete user.password;
  user.parent_role_id = null;
  user.super_parent_role_id = null;
  if (user.parent_id != null) {
    var user_parent_id = await getParentRoleModel(user.parent_id);
    user.parent_role_id = user_parent_id.role_id;
    var getSuperRoleId = await getSuperRoleIdModel(user.super_parent_id);
    user.super_parent_role_id = getSuperRoleId.role_id;
  }
  var getModulePermission = await getModulePermissions(user.role_id);
  user.permissions = getModulePermission;

  return apiResponse(req, res, user, 200, "Success");
};

exports.editProfile = async (req, res) => {
  var user_id = req.user.user_id;

  var user_profile = await updateUserProfileModel(req.body, user_id);

  if (user_profile.affectedRows > 0) {
    var user = await getUserProfileModel(user_id);
    user = user[0];

    user.parent_role_id = null;
    user.super_parent_role_id = null;
    if (user.parent_id != null) {
      var user_parent_id = await getParentRoleModel(user.parent_id);
      user.parent_role_id = user_parent_id.role_id;

      var getSuperRoleId = await getSuperRoleIdModel(user.super_parent_id);
      user.super_parent_role_id = getSuperRoleId.role_id;
    }
    var getModulePermission = await getModulePermissions(user.role_id);
    user.permissions = getModulePermission;
    delete user.password;
    return apiResponse(req, res, user, 200, "User Profile updated successfully");
  }

  return apiResponse(req, res, user[0], 404, "Something went wrong");
};

exports.updatePassword = async (req, res) => {
  var user_id = req.user.user_id;

  var user = await getUserProfileModel(user_id);

  if (user.length === 0) {
    return apiResponse(req, res, {}, 404, "User not found. Please try again.");
  }

  const passwordIsValid = bcrypt.compareSync(req.body.currentPassword, user[0].password);

  if (!passwordIsValid) {
    return apiResponse(req, res, {}, 404, "Invalid current password. Please try again.");
  }

  var userUpdate = await updateUserPasswordModel(bcrypt.hashSync(req.body.newPassword, 8), req.user.user_id);

  if (userUpdate.affectedRows > 0) {
    return apiResponse(req, res, {}, 200, "Password updated successfully");
  }

  return apiResponse(req, res, {}, 500, "Something went wrong");
};

exports.changeStatus = async (req, res) => {
  var status = await changeStatusModel(req.body);

  if (status[0].affectedRows > 0) {
    var user = await editSubAdminModel(req.body.user_id);

    const email = user[0].email;
    const name = user[0].name;
    const options = {
      name,
      email,
      subject: "Change Status Notification",
      file_name: "user_status_update",
      status: req.body.status == 1 ? "Your status has been approved" : "Your status has been un-approved",
    };

    const mail_sent = await sendEmail(options);

    return apiResponse(req, res, {}, 200, "User status updated successfully");
  }
};

exports.verifySignUpOTP = async (req, res) => {
  const { otp, id } = req.body;

  var is_valid_user = await matchSignUpOtpModel(otp, id);

  if (is_valid_user.length === 0) {
    return apiResponse(req, res, {}, 404, "OTP is not valid. Please try again.");
  }

  return apiResponse(req, res, { token: token }, 200, "OTP is valid");
};
exports.verifyOTP = async (req, res) => {
  const { otp } = req.body;

  var is_valid_user = await matchOtpModel(otp);

  if (is_valid_user === "1") {
    return apiResponse(req, res, {}, 404, "OTP is not valid. Please try again.");
  }

  if (is_valid_user === "2") {
    return apiResponse(req, res, {}, 404, "OTP is expired. Please try again.");
  }

  var token = jwt.sign(
    {
      user_id: is_valid_user[0].user_id,
    },
    process.env.JWT_SECRET
  );

  return apiResponse(req, res, { token: token }, 200, "OTP is valid");
};

exports.resetPassword = async (req, res) => {
  const { new_password, confirm_password, token } = req.body;

  userObj = jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      console.error("JWT verification failed:", err.message);
      return apiResponse(req, res, {}, 404, "Invalid OTP. Please try again.");
      // Handle verification failure
    } else {
      return decoded;
      // Use the decoded payload as needed
    }
  });

  var user_id = userObj.user_id;

  var valid_token = await matchOtpUserIdModel(user_id);
  if (valid_token === "1") {
    return apiResponse(req, res, {}, 404, "OTP is not valid. Please try again.");
  }

  if (new_password != confirm_password) {
    return apiResponse(req, res, {}, 404, "Password does not match. Please try again.");
  }

  var user = await updatePasswordModel(bcrypt.hashSync(req.body.new_password, 8), user_id);

  if (user.affectedRows == 0) {
    return apiResponse(req, res, {}, 404, "Failed to update password. Please try again.");
  }

  await deleteOTPCodeModel(user_id);
  return apiResponse(req, res, {}, 200, "Password updated successfully");
};

exports.getProfileDetail = async (req, res) => {
  var user_id = req.user.user_id;

  var user = await getUserProfileModel(user_id);

  if (user.length === 0) {
    return apiResponse(req, res, {}, 404, "User not found. Please try again.");
  }
  user = user[0];
  delete user.password;
  user.parent_role_id = null;
  user.super_parent_role_id = null;
  if (user.parent_id != null) {
    var user_parent_id = await getParentRoleModel(user.parent_id);
    user.parent_role_id = user_parent_id.role_id;
    var getSuperRoleId = await getSuperRoleIdModel(user.super_parent_id);
    user.super_parent_role_id = getSuperRoleId.role_id;
  }
  var getModulePermission = await getModulePermissions(user.role_id);
  user.permissions = getModulePermission;

  return apiResponse(req, res, user, 200, "Success");
};

exports.editProfile = async (req, res) => {
  var user_id = req.user.user_id;

  var user_profile = await updateUserProfileModel(req.body, user_id);

  if (user_profile.affectedRows > 0) {
    var user = await getUserProfileModel(user_id);
    user = user[0];

    user.parent_role_id = null;
    user.super_parent_role_id = null;
    if (user.parent_id != null) {
      var user_parent_id = await getParentRoleModel(user.parent_id);
      user.parent_role_id = user_parent_id.role_id;

      var getSuperRoleId = await getSuperRoleIdModel(user.super_parent_id);
      user.super_parent_role_id = getSuperRoleId.role_id;
    }
    var getModulePermission = await getModulePermissions(user.role_id);
    user.permissions = getModulePermission;
    delete user.password;
    return apiResponse(req, res, user, 200, "User Profile updated successfully");
  }

  return apiResponse(req, res, user[0], 404, "Something went wrong");
};

exports.updatePassword = async (req, res) => {
  var user_id = req.user.user_id;

  var user = await getUserProfileModel(user_id);

  if (user.length === 0) {
    return apiResponse(req, res, {}, 404, "User not found. Please try again.");
  }

  const passwordIsValid = bcrypt.compareSync(req.body.currentPassword, user[0].password);

  if (!passwordIsValid) {
    return apiResponse(req, res, {}, 404, "Invalid current password. Please try again.");
  }

  var userUpdate = await updateUserPasswordModel(bcrypt.hashSync(req.body.newPassword, 8), req.user.user_id);

  if (userUpdate.affectedRows > 0) {
    return apiResponse(req, res, {}, 200, "Password updated successfully");
  }

  return apiResponse(req, res, {}, 500, "Something went wrong");
};

exports.changeStatus = async (req, res) => {
  var status = await changeStatusModel(req.body);

  console.log(status);
  if (status[0].affectedRows > 0) {
    var user = await editSubAdminModel(req.body.user_id);

    const email = user[0].email;
    const name = user[0].name;
    const options = {
      name,
      email,
      subject: "Change Status Notification",
      file_name: "user_status_update",
    };

    const mail_sent = await sendEmail(options);

    return apiResponse(req, res, {}, 200, "User status updated successfully");
  }

  return apiResponse(req, res, {}, 404, "Something went wrong");
};
exports.health = async (req, res) => {
  return apiResponse(req, res, {}, 200, "Health is ok");
};

exports.resendOTP = async (req, res) => {
  let otp_code = Math.floor(100000 + Math.random() * 900000);

  const { id, name, email } = req.body;
  const options = {
    name,
    email: email,
    subject: "Four Digit Code",
    file_name: "send_otp",
    otp_code,
  };

  const mail_sent = await sendEmail(options);

  if (mail_sent == false) {
    return apiResponse(req, res, {}, 404, "Failed to send email. Please try again.");
  } else {
    var saveOtp = await updateUserOtp(otp_code, id);
    if (saveOtp) {
      return apiResponse(req, res, user, 200, "Email sent successfully");
    }
    if (saveOtp.length === 0) {
      return apiResponse(req, res, {}, 404, "Something went wrong. Please try again.");
    }
  }

  return apiResponse(req, res, {}, 200, "OTP send successfully");
};

// async function createErpNextCompany(req, res, user) {
//   var instance = await axios.create({
//     baseURL,
//     auth: {
//       username: apiErpKey,
//       password: apiErpSecret,
//     },
//   });
//   ``;
//   console.log("hello world 123", user);
//   try {
//     //var companyName = user[0].company_name || user[0].name;
//     const params = {
//       column: user[0].company_name == null ? "name" : "company_name",
//       company_name: user[0].company_name || user[0].name,
//       doctype: "Company",
//     };

//     var is_valid_company_name;
//     while (true) {
//       var is_valid_company_name = await checkAndGenerateUniqueCompanyName(params, user[0].id);

//       if (is_valid_company_name !== "1") {
//         break;
//       } else {
//         const newCompanyName = `${params.company_name} 1`;
//         params.company_name = newCompanyName;
//       }
//     }

//     const company_obj = {
//       doctype: "Company",
//       company_name: is_valid_company_name,
//       default_currency: "PKR",
//     };
//     const response = await instance.post("/api/resource/Company", company_obj);

//     if (response.data.data) {
//       const update_erp_params = {
//         id: user[0].id,
//         erpnext_company_name: response.data.data.name,
//         erpnext_company_abbr: response.data.data.abbr,
//       };
//       var updateErpDetails = await updateErpCompanyDetails(update_erp_params);
//       return response.data.data;
//     }
//   } catch (error) {
//     if (error.response) {
//       console.error("Error adding Company:", error.response.data);
//       return apiResponse(req, res, error.response.data, 404, "Failed to Add Company in Erp");
//     } else {
//       console.error("Error adding Company:", error.message);
//       return apiResponse(req, res, error.message, 404, "Failed to Add Company in Erp");
//     }
//   }
// }

// exports.paymentRequest = async (req, res) => {
//   const { email, name, amount, currency } = req.body;

//   const PAYTABS_SERVER_KEY = "SBJNHHJNMR-JHLR2RRNNK-222BW6ZZ2N";
//   const PROFILE_ID = "107249";

//   const CALLBACK_URL =
//     "https://b151-110-93-219-255.ngrok-free.app/api/payment-success";
//   const RETURN_URL =
//     "https://b151-110-93-219-255.ngrok-free.app/api/payment-return";

//   try {
//     const response = await fetch("https://secure.paytabs.sa/payment/request", {
//       method: "POST",
//       headers: {
//         Authorization: `${PAYTABS_SERVER_KEY}`,
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         profile_id: PROFILE_ID,
//         tran_type: "sale",
//         tran_class: "ecom",
//         cart_id: `cart_${Math.random().toString(36).substr(2, 9)}`,
//         cart_description: "Subscription payment",
//         tokenise: 2,
//         cart_currency: currency,
//         cart_amount: amount,
//         customer_details: {
//           name,
//           email,

//         },
//         hide_shipping: true,
//         callback: CALLBACK_URL,
//         return: RETURN_URL,
//       }),
//     });

//     if (!response.ok) {
//       const errorData = await response.json();
//       throw new Error(`PayTabs API Error: ${errorData.message}`);
//     }

//     const data = await response.json();
//     console.log(data);
//     res.send({ paymentUrl: data.redirect_url });
//   } catch (error) {
//     console.error("Payment Request Error:", error.message);
//     res.status(400).send({ error: { message: error.message } });
//   }
// };

// exports.paymentCallback = async (req, res) => {
//   try {
//     const { token } = req.body;
//     console.log("Received token:", req.body);

//     console.log("Received token:", token);

//     res.status(200).send({ message: "Token received successfully." });
//   } catch (error) {
//     console.error("Error handling callback:", error.message);
//     res.status(500).send({ error: { message: "Error handling callback." } });
//   }
// };

// exports.paymentReturn = async (req, res) => {
//   const {
//     acquirerMessage,
//     acquirerRRN,
//     cartId,
//     customerEmail,
//     respCode,
//     respMessage,
//     respStatus,
//     token,
//     tranRef,
//     signature,
//   } = req.query;

//   // console.log("Payment return received:", req.query);

//   if (respStatus === "A") {
//     // Payment is authorized
//     console.log("Payment authorized. Token:", token);
//     // Process token and update payment status
//   } else {
//     console.error("Payment failed. Reason:", respMessage);
//   }

//   res.status(200).send({ message: "Return processed successfully." });
// };

// // Recurring payment request
// exports.recurringPaymentRequest = async (req, res) => {
//   const { token, tran_ref, amount, currency, cart_id, cart_description } =
//     req.body;
//   const PAYTABS_SERVER_KEY = "SBJNHHJNMR-JHLR2RRNNK-222BW6ZZ2N";
//   const PROFILE_ID = "107249";

//   // Log the received request body to debug
//   console.log("Received request body:", req.body);

//   // Validate required parameters
//   // if (!token || !tran_ref || !amount || !currency || !cart_id || !cart_description) {
//   //   res.status(400).send({ error: { message: "Missing required parameters." } });
//   //   return;
//   // }

//   try {
//     const response = await fetch("https://secure.paytabs.sa/payment/request", {
//       method: "POST",
//       headers: {
//         Authorization: `${PAYTABS_SERVER_KEY}`,
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         profile_id: PROFILE_ID,
//         tran_type: "sale",
//         tran_class: "recurring",
//         cart_id,
//         cart_currency: currency,
//         cart_amount: amount,
//         cart_description,
//         token,
//         tran_ref,
//       }),
//     });

//     const responseData = await response.json();

//     // Log the response data to debug
//     console.log("PayTabs API response data:", responseData);

//     if (!response.ok) {
//       throw new Error(
//         `PayTabs API Error: ${responseData.message} | Details: ${JSON.stringify(
//           responseData
//         )}`
//       );
//     }

//     res.send(responseData);
//   } catch (error) {
//     console.error("Recurring Payment Request Error:", error.message);
//     res.status(400).send({ error: { message: error.message } });
//   }
// };

exports.googleLogin = async (req, res) => {
  const { googleResponse, data } = req.body;

  const user = await loginModel(data.email);

  if (user.length > 0) {
    await updateGoogleToken(data.email, googleResponse.credential);
    return apiResponse(req, res, {}, 200, "Success");
  } else {
    //Get six digit random code
    let orig_password = getSixDigitCode();
    orig_password = `${orig_password}00`;
    console.log("orig_password", orig_password);
    const password = bcrypt.hashSync(orig_password, 8);
    console.log("password", password);
    await createGoogleLoginUser(data.name, data.email, password, googleResponse.credential);

    const options = {
      name: data.name,
      email: data.email,
      subject: "Login password",
      file_name: "send_google_login_password",
      orig_password,
    };

    const mail_sent = await sendEmail(options);

    if (mail_sent == false) {
      return apiResponse(req, res, {}, 404, "Failed to send email. Please try again.");
    }

    return apiResponse(req, res, {}, 200, "Success");
  }
};

exports.adminGoogleSignIn = async (req, res) => {
  const { googleResponse, data } = req.body;

  var user = await loginModel(data.email);

  if (user.length > 0) {
    await updateGoogleToken(data.email, googleResponse.credential);
  } else {
    //Get six digit random code
    let orig_password = getSixDigitCode();
    orig_password = `${orig_password}00`;
    const password = bcrypt.hashSync(orig_password, 8);
    await createGoogleLoginUser(data.name, data.email, password, googleResponse.credential);

    var user = await loginModel(data.email);
  }
  user = user[0];
  // if (user.status === 0) {
  //   return apiResponse(req, res, {}, 404, "Inactive user.");
  // } else {
  //   if (user.super_parent_id !== null) {
  //     var super_user = await editSubAdminModel(user.super_parent_id);
  //
  //     if (super_user[0].status === 0) {
  //       return apiResponse(req, res, {}, 404, "Inactive user.");
  //     }
  //   }
  // }
  //
  // if (!(user.role_id == 1 || user.super_parent_id === 1)) {
  //   var check_user_subscriber = await isUserSubscribePackage(user.super_parent_id || user.id);
  //   if (!check_user_subscriber) {
  //     return apiResponse(req, res, {}, 404, "Please purchase subscription.");
  //   }
  // }

  user.parent_role_id = null;
  user.super_parent_role_id = null;
  if (user.parent_id != null) {
    var user_parent_id = await getParentRoleModel(user.parent_id);
    user.parent_role_id = user_parent_id.role_id;

    var getSuperRoleId = await getSuperRoleIdModel(user.super_parent_id);
    user.super_parent_role_id = getSuperRoleId.role_id;
  }

  var getModulePermission = await getModulePermissions(user.role_id);
  user.permissions = getModulePermission;
  var token = "";
  token = jwt.sign(
    {
      user_id: user.id,
      email: user.email,
      role_id: user.role_id,
      parent_id: user.parent_id,
      super_parent_id: user.super_parent_id,
      super_parent_role_id: user.super_parent_role_id,
      company_name: user.erpnext_company_name,
      company_abbr: user.erpnext_company_abbr,
    },
    process.env.JWT_SECRET
  );

  user.ACCESS_TOKEN = token;
  delete user.password;
  var store_user_token = await addSessionModel(token, user.id);
  if (store_user_token.affectedRows > 0) {
    return apiResponse(req, res, user, 200, "User logged in successfully");
  }
  return apiResponse(req, res, user, 200, "User logged in successfully");
};
