const express = require("express");
const router = express.Router();
const { loginRequired, validate, userTokenMiddleware } = require("@base/middleware");
const { registerSchema, loginSchema, forgetPasswordSchema, verifyOTPValidation, resetPasswordSchema, updateUserPasswordSchema, resendOTPValidation, changeStatusSchema } = require("@base/validation");
const { login, register, forgetPassword, verifyOTP, resetPassword, getProfileDetail, editProfile, updatePassword, changeStatus, health, verifySignUpOTP, resendOTP, paymentRequest, paymentCallback, paymentReturn, recurringPaymentRequest, googleLogin, adminGoogleSignIn } = require("@controllers/AuthController");

router.route("/login").post(validate(loginSchema), login);
router.route("/adminGoogleSignIn").post(adminGoogleSignIn);
router.route("/register").post(validate(registerSchema), register);
router.route("/forgetPassword").post(validate(forgetPasswordSchema), forgetPassword);
router.route("/verifyOTP").post(validate(verifyOTPValidation), verifyOTP);
router.route("/resetPassword").post(validate(resetPasswordSchema), resetPassword);
router.route("/getProfileDetail").get(userTokenMiddleware, getProfileDetail);
router.route("/editProfile").post(userTokenMiddleware, editProfile);
router.route("/updatePassword").post(validate(updateUserPasswordSchema), userTokenMiddleware, updatePassword);
router.route("/changeStatus").post(validate(changeStatusSchema), loginRequired, changeStatus);
router.route("/health").get(health);
router.route("/verifySignUpOTP").post(validate(verifyOTPValidation), verifySignUpOTP);
router.route("/resendOTP").post(validate(resendOTPValidation), resendOTP);

router.route("/googleLogin").post(googleLogin);


// router.route("/payment-request").post(paymentRequest);

// router.route("/payment-success").post(paymentCallback);

// router.route('/payment-return').get(paymentReturn);

// router.route('/recurring-payment-request').post(recurringPaymentRequest);

module.exports = router;
