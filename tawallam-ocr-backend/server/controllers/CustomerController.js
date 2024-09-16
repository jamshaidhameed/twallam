const express = require("express");
const { apiResponse } = require("@utils");
const axios = require("axios");
const { addCustomerValidation, editCustomerValidation, getCustomerValidation, deleteCustomerValidation } = require("../helpers/CustomerValidation");
const { addCustomerModel, editCustomerModel, getCustomerModel, listCustomersModel, deleteCustomerModel, getCustomerByVatNumberModel, checkItsVatNoModel, updateErpCustomerModel, getCustomerByZidCustomerEmail } = require("../repositories/CustomerRepository");
const { isCustomerInvoiceExistModel } = require("../repositories/invoiceRepository");
const {getCustomers} = require("@services/zid");
const {getErpCompanyDetails, makeUniqueSupplierOrCustomer} = require("@helpers/helpers");
const router = express.Router();

const baseURL = process.env.ERP_BASE_URL;
const apiErpKey = process.env.ERP_APIKEY;
const apiErpSecret = process.env.ERP_APISECRET;

async function addOrUpdateSupplier(customerObj) {
  try {
    var instance = await axios.create({
      baseURL,
      auth: {
        username: apiErpKey,
        password: apiErpSecret,
      },
    });
    ``;

    const taxID = customerObj.vat_number;

    const params = {
      fields: JSON.stringify(["*"]),
    };
    //try {
    const queryURL = `/api/resource/Supplier?filters=[["Supplier","tax_id","=","${taxID}"]]`;
    const response = await instance.get(queryURL);
    if (response.data.data.length == 0) {
      console.log("response customer added 1", customerObj);
      const create_customer_response = await instance.post("/api/resource/Supplier", customerObj);

      if (create_customer_response.data.data) {
        console.log("response customer added 22");
        const queryURL = `/api/resource/Supplier?filters=[["Supplier","tax_id","=","${taxID}"]]`;
        const response_update = await instance.get(queryURL);

        var update_erp_details = await updateErpCustomerModel(response_update.data.data.length > 0 ? response_update.data.data[0].name : customerObj.name, customerObj.customer_id);

        return "success";
      } else {
        return apiResponse(req, res, create_customer_response.data.data, 404, "Failed to Add Customer in Erp");
      }
    }

    if (response.data.data) {
      var update_erp_details = await updateErpCustomerModel(response.data.data[0].name, customerObj.customer_id);
      return "success";
    }
  } catch (error) {
    console.error("Error adding customer:", error.response ? error.response.data : error.message);
    return apiResponse(req, res, response.data.data, 404, "Failed to Add Customer in Erp");
  }
}

async function addOrUpdateCustomer(customerObj, req, res) {
  var instance = await axios.create({
    baseURL,
    auth: {
      username: apiErpKey,
      password: apiErpSecret,
    },
  });
  ``;

  const taxID = customerObj.vat_number;
  const email = customerObj.email_id;

  console.log("Customer Tax_id ", taxID);
  const params = {
    fields: JSON.stringify(["*"]),
  };
  try {


    var queryURL;

    if (customerObj.is_zid  !== undefined && customerObj.is_zid === 'yes'){
       queryURL = `/api/resource/Customer?filters=[["Customer","email_id","=","${email}"]]`;
    }
    else {
       queryURL = `/api/resource/Customer?filters=[["Customer","tax_id","=","${taxID}"]]`;
    }
    const response = await instance.get(queryURL);
    console.log("Get customer response through Tax_id ", response.data.data);
    if (response.data.data.length == 0) {
      const customer_name = await makeUniqueSupplierOrCustomer(customerObj, req, res);
      customerObj.customer_name = customer_name.name;

      var update_erp_details = await updateErpCustomerModel(customerObj.customer_name, customerObj.customer_id);
      return customerObj.customer_name;

      // console.log("Customer payload after tax_id", customerObj);
      // const create_customer_response = await instance.post("/api/resource/Customer", customerObj);

      // if (create_customer_response.data.data) {
      //   console.log("Customer created Successfully");
      //   const queryURL = `/api/resource/Customer?filters=[["Customer","tax_id","=","${taxID}"]]`;
      //   const response_update = await instance.get(queryURL);

      //   var update_erp_details = await updateErpCustomerModel(response_update.data.data.length > 0 ? response_update.data.data[0].name : customerObj.name, customerObj.customer_id);

      //   return "success";
      // } else {
      //   return apiResponse(req, res, create_customer_response.data.data, 404, "Failed to Add Customer in Erp");
      // }
    }

    if (response.data.data) {
      console.log("Customer already exist through Tax_id");
      customerObj.customer_name = response.data.data[0].name;
      var update_erp_details = await updateErpCustomerModel(response.data.data[0].name, customerObj.customer_id);
      return customerObj.customer_name;
    }
  } catch (error) {
    // console.error("Error adding customer:", error.response ? error.response.data : error.message);
    // return apiResponse(req, res, response.data.data, 404, "Failed to Add Customer in Erp");

    if (error.response) {
      console.error("Error adding customer:", error.response.data);
      return apiResponse(req, res, error.response.data, 404, "Failed to Add Customer in Erp");
    } else {
      console.error("Error adding customer:", error.message);
      return apiResponse(req, res, error.message, 404, "Failed to Add Customer in Erp");
    }
  }
}
// async function addOrUpdateCustomer(customerObj) {
//   var instance = await axios.create({
//     baseURL,
//     auth: {
//       username: apiErpKey,
//       password: apiErpSecret,
//     },
//   });
//   ``;
//
//   const taxID = customerObj.vat_number;
//
//   const params = {
//     fields: JSON.stringify(["*"]),
//   };
//   try {
//     const queryURL = `/api/resource/Customer?filters=[["Customer","tax_id","=","${taxID}"]]`;
//     const response = await instance.get(queryURL);
//     if (response.data.data.length == 0) {
//       console.log("response customer added 1", customerObj);
//       const create_customer_response = await instance.post("/api/resource/Customer", customerObj);
//
//       if (create_customer_response.data.data) {
//         const queryURL = `/api/resource/Customer?filters=[["Customer","tax_id","=","${taxID}"]]`;
//         const response_update = await instance.get(queryURL);
//
//         var update_erp_details = await updateErpCustomerModel(response_update.data.data.length > 0 ? response_update.data.data[0].name : customerObj.name, customerObj.customer_id);
//
//         return "success";
//       } else {
//         return apiResponse(req, res, create_customer_response.data.data, 404, "Failed to Add Customer in Erp");
//       }
//     }
//
//     if (response.data.data) {
//       var update_erp_details = await updateErpCustomerModel(response.data.data[0].name, customerObj.customer_id);
//       return "success";
//     }
//   } catch (error) {
//     console.error("Error adding customer:", error.response ? error.response.data : error.message);
//     return apiResponse(req, res, response.data.data, 404, "Failed to Add Customer in Erp");
//   }
// }

exports.addCustomer = async (req, res) => {
  const { error } = addCustomerValidation(req.body);
  if (error) {
    return apiResponse(req, res, {}, 400, error.details[0].message);
  }
  req.body.company_id = req.user.super_parent_id ?? req.user.user_id;
  var Customer_detail = await getCustomerByVatNumberModel(req.body);

  if (Customer_detail.length > 0) {
    return apiResponse(req, res, {}, 404, "Vendor vat number already in used");
  }
  var customerObj = {};
  req.body.customer_or_supplier = req.body.type;
  var Customer = await addCustomerModel(req.body);
  if (Customer === 0) {
    return apiResponse(req, res, {}, 404, "Failed To Add Customer");
  }
  var params = { id: Customer };

  var Customer_details = await getCustomerModel(params);
  var Customer_detail;

  customerObj = {
    customer_id: Customer_details[0].id,
    vat_number: Customer_details[0].vat_number,
    // supplier_name: req.body.customer_id === undefined ? req.body.name : Customer_detail[0].name,
    [req.body.type === "supplier" ? "supplier_name" : "customer_name"]: Customer_details[0].name,
    customer_type: req.user == 2 ? "Company" : "Individual",
    customer_or_supplier: req.body.type === "supplier" ? "supplier" : "customer",
    mobile: req.body.mobile || "",
    tax_id: Customer_details[0].vat_number,
    phone: req.body.phone || "",
    email_id: req.user.email || "",
  };

  //already exist

  req.body.customer_id = Customer_details[0].id;

  if (Customer_details[0].erpnext_customer_id === null || Customer_details[0].erpnext_customer_id === "") {
    console.log("hee", customerObj);
    if (Customer_details[0].type === "supplier") {
      await addOrUpdateSupplier(customerObj)
        .then((result) => {
          console.log("Customer operation result:", result);
          // Handle success
        })
        .catch((error) => {
          return apiResponse(req, res, error, 404, error);
        });
      return apiResponse(req, res, {}, 200, "Customer Successfully Added");
    } else {
      await addOrUpdateCustomer(customerObj)
        .then((result) => {
          console.log("Customer operation result:", result);
          // Handle success
        })
        .catch((error) => {
          return apiResponse(req, res, error, 404, error);
        });
      return apiResponse(req, res, {}, 200, "Customer Successfully Added");
    }
  }
};
exports.editCustomer = async (req, res) => {
  const { error } = editCustomerValidation(req.body);
  if (error) {
    return apiResponse(req, res, {}, 404, error.details[0].message);
  }
  req.body.company_id = req.user.super_parent_id ?? req.user.user_id;

  var Customer_detail = await checkItsVatNoModel(req.body);

  if (Customer_detail.length > 0) {
    return apiResponse(req, res, {}, 404, "Vendor vat number already in used");
  }

  var Customer = await editCustomerModel(req.body);

  if (Customer.affectedRows === 0) {
    return apiResponse(req, res, {}, 404, "Failed to update Customer");
  }
  return apiResponse(req, res, {}, 200, "Customer updated Successfully");
};

exports.getCustomer = async (req, res) => {
  const { error } = getCustomerValidation(req.query);

  if (error) {
    return apiResponse(req, res, {}, 404, error.details[0].message);
  }
  var Customer = await getCustomerModel(req.query);

  if (Customer.length === 0) {
    return apiResponse(req, res, {}, 404, "No customer found");
  }
  return apiResponse(req, res, Customer[0], 200, "Customer Get Successfully");
};

exports.listCustomers = async (req, res) => {

  console.log('reggg  hh',req.user)
  const data = {
    page: parseInt(req.body.page) || 1,
    per_page: parseInt(req.body.limit) || 10,
    token: req.user.zid_authorization_token,
    access_token: req.user.zid_access_token
  }
  const {customers: customers_list} = await getCustomers(data);
  // const customer_list = await getCustomers(data);

  console.log('customers_data',customers_list)


  var customerObj = {};
  req.body.customer_or_supplier = req.body.type;

  await Promise.all(
      customers_list.map(async (customer) => {

        console.log('customer obj',customer)
        var erpCompanyResponse;
        var supplier_info;
        if (req.user.company_abbr == null) {
          erpCompanyResponse = await getErpCompanyDetails(req, res);
        }
        var company_names = req.user.company_name == null ? erpCompanyResponse.name : req.user.company_name,

        customerObj = {
          customer_id: customer.id,
          vat_number: customer.tax_number || '',
          customer_name: customer.name,
          customer_type: req.user.role_id == 2 ? "Company" : "Individual",
          customer_or_supplier: 'customer',
          mobile: customer.mobile || "",
          tax_id: customer.tax_number || '',
          phone: customer.mobile || "",
          email_id: customer.email || "",
          company: company_names,
          is_zid: 'yes'
        };

        // supplier_info = await addOrUpdateCustomer(customerObj, req, res);

        // console.log('supplier_info',supplier_info)


        console.log('customer.email',customer.email)
        const customer_record = await getCustomerByZidCustomerEmail(customer.email);

        console.log('customer_record',customer_record)
        if (customer_record.length === 0) {

          const body = {
            company_id: req.user.super_parent_id ?? req.user.user_id,
            name: customer.name,
            email: customer.email,
            address: customer.address || '',
            account_no: null,
            phone: null,
            mobile: customer.mobile,
            vat_number: customer.tax_number || '',
            zid_customer_id: customer.id,
            customer_or_supplier: 'customer',
            erpnext_customer_id: supplier_info,
          }
          await addCustomerModel(body);
        }
      })
  );



  var company_id = req.user.super_parent_id ?? req.user.user_id;
  var customers = await listCustomersModel(company_id, req.query.type, req.query.is_zid);

  console.log('customerscustomerscustomers',customers)

  if (customers.length === 0) {
    return apiResponse(req, res, [], 200, "No record found.");
  }
  return apiResponse(req, res, customers, 200, "Success");
};
exports.deleteCustomer = async (req, res) => {
  const { error } = deleteCustomerValidation(req.body);

  if (error) {
    return helpers.apiResponse(req, res, {}, 404, error.details[0].message);
  }

  var get_invoices = await isCustomerInvoiceExistModel(req.body);
  if (get_invoices.length > 0) {
    return apiResponse(req, res, {}, 404, "Record cannot be delete");
  }

  var Customer = await deleteCustomerModel(req.body);

  if (Customer.affectedRows === 0) {
    return apiResponse(req, res, {}, 404, "Failed to Delete Customer");
  }
  return apiResponse(req, res, {}, 200, "Customer Deleted Successfully");
};

