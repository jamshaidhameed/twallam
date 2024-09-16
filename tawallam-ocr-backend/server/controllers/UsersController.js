const { apiResponse } = require("@utils");
const { attachPaymentMethodModel, getCustomerId, getSubscriptionModel } = require("../repositories/userRepository");
const {getSuperAdminModel} = require("../repositories/authRepository");
const sendEmail = require("../services/mail");
const { saveUserSubscriptionModel } = require("../repositories/SubscriptionRepository");

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

exports.attachPaymentMethod = async (req, res) => {

  const source = req.body.token.id;
  const jwt_token = req.body.jwt_token;
  // console.log('token', source);
  // console.log('jwt', jwt_token);
  // console.log('product_id', req.body.product_id);
    // const paymentSource = await getOrCreatePaymentUser(req.user);


    userObj = jwt.verify(jwt_token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
          // console.error("JWT verification failed:", err.message);
          return apiResponse(req, res, {}, 404, "Invalid OTP. Please try again.");
          // Handle verification failure
      } else {
          return decoded;
          // Use the decoded payload as needed
      }
  });

  var user_id = userObj.user_id;
  // console.log('user_id',user_id);

    var customer = await getCustomerId(user_id);
    var customer_id = customer[0].customer_id;
    // console.log('customer_id =======>',customer_id);
    var subscriptionData = await addCustomerPaymentMethod(customer_id, source);
  // console.log('subscription DAtA=======>', subscriptionData);
    var subscription = await getSubscriptionModel(req.body.product_id);
    // console.log('subscrfipotion', subscription);
    var price_id = subscription[0].price_id;
    // console.log('price_id ======>', price_id);
    if(subscription.length < 1 ) {
      // console.log('not found');
      return apiResponse(req, res, {}, 404, " Subscription Package not found");
    }
 var response =  await createSubscription(price_id, customer_id);
// console.log('subscripton response', response);

    const data = {
      user_id : user_id,
      subscription_id : response.id,
      package_id : subscription[0].id,
      package_name : subscription[0].title
    }
    // console.log('user sub data', data);
    await saveUserSubscriptionModel(data);
  // if (subscription.length === 0) {
  //   return apiResponse(req, res, {}, 404, "Failure to add payment method");
  // }
// console.log(customer);
// console.log(subscription);

  var super_admin_user = await getSuperAdminModel();
// console.log('admin',  super_admin_user);

  if (super_admin_user.length > 0) {
      const name = customer[0].name;
      const {email} = super_admin_user[0];
      const user_email = customer[0].email;
      const super_admin_name = super_admin_user[0].name;
      const title = subscription[0].title;
      const price = subscription[0].price;
      const duration = subscription[0].duration;
// console.log('name', name);
// console.log('title', title);

      const options = {
          name,
          email,
          super_admin_name,
          user_email,
          subject: "User has subscribed",
          file_name: "subscriptionPayment",
          title,
          price,
          duration,
      };

      // console.log('=====================options=====================');
      // console.log(options);

      const mail_sent = await sendEmail(options);
  }



  return apiResponse(req, res, {}, 200, " Payment method added successfully");
};

const getOrCreatePaymentUser = async(user) => {

  var userData = await getCustomerId(user);
  if(userData.customer_id !== null); 
}


//strip.js
// Payment methods


const createSubscription = async (price_id, paymentUser) => {
  // console.log('step 2', price_id);
  // console.log('step 2', paymentUser);
    // const trial = paymentUser.trialAvailed ? 0 : payload.trial_period ?? 0;
    const sourceData = await stripe.subscriptions.create({
      customer: paymentUser,
      items: [{ price: price_id }],
    });

    return sourceData;

};
  





const createPaymentMethod = async (card) => {
  return await stripe.paymentMethods.create(card);
};
const attachPaymentMethod = async (paymentMethod, customer) => {
  return await stripe.paymentMethods.attach(paymentMethod, { customer });
};
const detachPaymentMethod = async (paymentMethod) => {
  return await stripe.paymentMethods.detach(paymentMethod);
};
const addCustomerPaymentMethod = async (customerId, source, isDefault = true) => {
  try {
    // create payment method
    const paymentMethod = await createPaymentMethod({type: "card", "card[token]": source,});

    // attach to customer
    await attachPaymentMethod(paymentMethod.id, customerId);
    if (isDefault) {
      await stripe.customers.update(customerId, {
        invoice_settings: { default_payment_method: paymentMethod.id },
      });
    }

    return true;
  } catch (error) {
    throw new Error(error);
  }
};
const getCustomerPaymentMethods = async (customerId) => {
  return await stripe.customers.listPaymentMethods(customerId, {
    type: "card",
  });
};

