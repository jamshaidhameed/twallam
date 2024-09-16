const { apiResponse } = require("@utils");
//const { pagesValidation, editpageValidation, delete_pagesValidation, getPagelidate, sectionValidation } = require("../helpers/PagesValidation");
const { uploadFile, getSixDigitCode, createErpNextCompany } = require("../helpers/helpers");
const { getTokensByCode, getMerchantProfile, getOrders, getCustomers}= require("@services/zid");
const { registerModel, createZidUser } = require("../repositories/authRepository");
const sendEmail = require("../services/mail");
const bcrypt = require("bcryptjs");
const axios = require("axios");

exports.redirectToZid = async (req, res) => {

    const queries = new URLSearchParams({
        client_id: process.env.ZID_CLIENT_ID,
        redirect_uri: `${process.env.MY_BACKEND_URL}auth/zid/callback`,
        response_type: 'code',
    });

    return res.redirect(`${process.env.ZID_AUTH_URL}/oauth/authorize?${queries}`);
};

exports.zidAuthCallback = async (req, res) => {
    
    console.log('reqqq',req.user)

    console.log('callback console')

// zid will redirect the user to your application again and send you `code` in the query parameters
    const zidCode = req.query.code;
    console.log('zidCode',zidCode)

    // from this code you must retrieve the merchant tokens to use them in your further requests
    const merchantTokens = await getTokensByCode(zidCode);

    const managerToken = merchantTokens.access_token;
    const authToken = merchantTokens.authorization;
    const refreshToken = merchantTokens.refresh_token;

    console.log('merchantTokens',merchantTokens)

    // Check if the user already exists in the database
    // let user = await UsersService.getUserByZidToken( managerToken);
    // if (!user) {
    //     const zidMerchantDetails = await getMerchantProfile(managerToken, authToken);
        // create user from zid merchant details response
    // }
    const zidMerchantDetails = await getMerchantProfile(managerToken, authToken);
    console.log('zidMerchantDetails',zidMerchantDetails)

    const user = zidMerchantDetails.user;

    //Get six digit random code
    let orig_password = getSixDigitCode();
    orig_password = `${orig_password}00`;
    const password = bcrypt.hashSync(orig_password, 8);

    const body = {
        company_name: user.name,
        // company_name: 'Twallam Zid',
        role_id: 2,
        email: user.email,
        password,
        zid_store_id: user.store.id,
        zid_access_token: merchantTokens.access_token,
        zid_refresh_token: merchantTokens.refresh_token,
        authorization_token: merchantTokens.authorization,
    }

    var zid_user = await createZidUser(body);
      await createErpNextCompany(req, res, zid_user);

    const options = {
        name: zid_user[0].name,
        email: zid_user[0].email,
        subject: "Login password",
        file_name: "send_google_login_password",
        orig_password,
    };

    const mail_sent = await sendEmail(options);

    if (mail_sent == false) {
        return apiResponse(req, res, {}, 404, "Failed to send email. Please try again.");
    }


    // by reaching here, the OAuth flow has been finished, and zid merchant now should be able to access your application.
    // continue with your own logic from now on please.
    //
    //
    // redirect the user to your application dashboard.
    // return res.redirect(' Your Dashboard URL ');
    return res.redirect(process.env.TAWALLAM_ADMIN_URL);
};


exports.getZidOrdersList = async (req, res) => {

    console.log('reggg  hh',req.user)
    const data = {
        page: parseInt(req.body.page) || 1,
        per_page: parseInt(req.body.limit) || 10,
        token: req.user.zid_authorization_token,
        access_token: req.user.zid_access_token
    }
    const {orders} = await getOrders(data);

    //
    //
    //
    // const url = `${process.env.ZID_AUTH_URL}/oauth/token`;
    // const requestBody = {
    //     grant_type: 'authorization_code',
    //     client_id: process.env.ZID_CLIENT_ID,
    //     client_secret: process.env.ZID_CLIENT_SECRET,
    //     redirect_uri: `${process.env.MY_BACKEND_URL}auth/zid/callback`,
    //     // code: code,
    // };
    //
    // const response = await axios.post(url, requestBody);
    // return response.data;

    return res.redirect(`${process.env.ZID_AUTH_URL}/oauth/authorize?${queries}`);
};
