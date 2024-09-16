const { apiResponse } = require("@utils");
const { addSubscriptionPackageModel, updateSubscriptionPackageModel, deleteSubscriptionPackageModel, getSubscriptionPackageModel, subscriptionPackageListModel, updateSubscriptionPackageTypeModel } = require("../repositories/SubscriptionRepository");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const RECURRING_INTERVALS = {
  month: {
    interval: "month",
    interval_count: 1,
  },
  quarterly: {
    interval: "month",
    interval_count: 3,
  },
  "six-months": {
    interval: "month",
    interval_count: 6,
  },
  year: {
    interval: "year",
    interval_count: 1,
  },
  days: {
    interval: "day",
    interval_count: 1,
  },
};

const getRecurring = (payload) => {
  const recurring = RECURRING_INTERVALS[payload.duration];
  if (payload.duration === "days") recurring.interval_count = payload.frequencyDays;
  return recurring;
};

const getProductActivePrices = async (product, limit = 100) => {
  return await stripe.prices.list({ active: true, product, limit });
};

exports.addSubscriptionPackage = async (req, res) => {

  console.log('req.',req.body)
  const product = await stripe.products.create({
    name: req.body.title,
    description: (req.body.description === '' ? '.' : req.body.description),
    active: req.body.status == 1,
  });

  const price = await stripe.prices.create({
    currency: "usd",
    product: product.id,
    active: req.body.status == 1,
    nickname: req.body.title,
    recurring: getRecurring(req.body),
    unit_amount: req.body.price * 100,
  });

  const subscriptionData = {
    title: req.body.title,
    title_ar: req.body.title_ar,
    description: req.body.description,
    description_ar: req.body.description_ar,
    price: req.body.price,
    duration: req.body.duration,
    status: req.body.status,
    product_id: product.id,
    price_id: price.id,
    users: req.body.users,
  };
  console.log("controller", subscriptionData);

  var subscription = await addSubscriptionPackageModel(subscriptionData);

  if (subscription.length === 0) {
    return apiResponse(req, res, {}, 404, "Failed To Add Subscription Package");
  }
  return apiResponse(req, res, subscriptionData, 200, " Subscription Package Added Successfully");
};

exports.updateSubscriptionPackage = async (req, res) => {
  const subscriptionPackage = await getSubscriptionPackageModel(req.body);
  if (subscriptionPackage.length === 0) return apiResponse(req, res, {}, 404, "No Subscription Package Found.");

  await stripe.products.update(subscriptionPackage[0].product_id, {
    name: req.body.title,
    description: req.body.description,
    active: req.body.status == 1,
  });

  let stripePrice = await stripe.prices.retrieve(subscriptionPackage[0].price_id);
  const updatedPrice = {
    currency: "usd",
    active: req.body.status == 1,
    nickname: req.body.title,
    recurring: getRecurring(req.body),
    unit_amount: req.body.price * 100,
    product: subscriptionPackage[0].product_id,
  };

  if (stripePrice.unit_amount != updatedPrice.unit_amount || stripePrice.recurring.interval != updatedPrice.recurring.interval) {
    if (stripePrice.active) {
      return await stripe.prices.update(subscriptionPackage[0].price_id, {
        active: false,
      });
    }

    stripePrice = await stripe.prices.create(updatedPrice);
  } else if (stripePrice.active != updatedPrice.active || stripePrice.nickname != updatedPrice.nickname) {
    stripePrice = await stripe.prices.update(subscriptionPackage[0].price_id, {
      active: updatedPrice.active,
      nickname: updatedPrice.nickname,
    });
  }

  var updateSubscription = await updateSubscriptionPackageModel({ ...req.body, price_id: stripePrice.id });
  if (updateSubscription.length === 0) {
    return apiResponse(req, res, {}, 404, "Failed to Update Subscription Package");
  }
  return apiResponse(req, res, {}, 200, "Subscription Package Updated Successfully");
};

exports.deleteSubscriptionPackage = async (req, res) => {
  let subscriptionPackage = await getSubscriptionPackageModel(req.body);
  if (subscriptionPackage.length === 0) return apiResponse(req, res, {}, 404, "No Subscription Package Found.");

  // Archive all prices
  const stripePrices = await getProductActivePrices(subscriptionPackage[0].product_id);
  for (const price of stripePrices.data) {
    await stripe.prices.update(price.id, {
      active: false,
    });
  }

  // Archive product
  await stripe.products.update(subscriptionPackage[0].product_id, {
    active: false,
  });

  subscriptionPackage = await deleteSubscriptionPackageModel(req.body);

  if (subscriptionPackage.length === 0) {
    return apiResponse(req, res, {}, 404, "Failed to  Delete Subscription Package");
  }
  return apiResponse(req, res, {}, 200, " Subscription Package Deleted Successfully");
};

exports.getSubscriptionPackage = async (req, res) => {
  var subscriptionPackage = await getSubscriptionPackageModel(req.query);

  if (subscriptionPackage.length === 0) {
    return apiResponse(req, res, {}, 404, "No Subscription Package Found.");
  }
  return apiResponse(req, res, subscriptionPackage[0], 200, "Success");
};

exports.subscriptionPackageList = async (req, res) => {
  var subscriptionPackages = await subscriptionPackageListModel();

  if (subscriptionPackages.length === 0) {
    return apiResponse(req, res, {}, 404, "No Page List Found.");
  }
  return apiResponse(req, res, subscriptionPackages, 200, "Success");
};

exports.updateSubscriptionType = async (req, res) => {
  const subscriptionPackage = await getSubscriptionPackageModel(req.body);
  if (subscriptionPackage.length === 0) return apiResponse(req, res, {}, 404, "No Subscription Package Found.");

  var updateSubscription = await updateSubscriptionPackageTypeModel(req.body);
  if (updateSubscription.length === 0) {
    return apiResponse(req, res, {}, 404, "Failed to Update Subscription Package Type");
  }
  return apiResponse(req, res, {}, 200, "Subscription Package Type Updated Successfully");
};
