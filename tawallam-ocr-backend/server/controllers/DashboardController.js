const { apiResponse } = require("@utils");
const path = require("path");
const fs = require("fs");
const {
  DashboardCardsModel,
  InvoiceStatsModel,
} = require("../repositories/DashboardRepository");

exports.getCardData = async (req, res) => {
  try {
    const company_id = req.user.super_parent_id || req.user.user_id;
    const role_id = req.user.super_parent_id || req.user.role_id;
    
    const records = await DashboardCardsModel(company_id, role_id);
    return apiResponse(
      req,
      res,
      records,
      200,
      "Dashboards Cards get successfully"
    );
  } catch (err) {
    console.error(err);

    return apiResponse(req, res, {}, 500, { message: err.message });
  }
};

exports.getInvoiceStats = async (req, res) => {
  try {
    const company_id = req.user.super_parent_id ?? req.user.user_id;
    console.log(company_id);
    const records = await InvoiceStatsModel(company_id);

    return apiResponse(
      req,
      res,
      records,
      200,
      "Invoice Stats get successfully"
    );
  } catch (err) {
    console.error(err);
    return apiResponse(req, res, {}, 500, { message: err.message });
  }
};
