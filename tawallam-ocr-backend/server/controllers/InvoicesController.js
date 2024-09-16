const { apiResponse } = require("@utils");
const axios = require("axios");
const { addInvoiceModel, deleteInvoiceModel, editInvoiceModel, editInvoiceDetailModel, updateInvoiceModel, listInvoicesModel, updateErpInvoiceModel, addUpdateErpItemModel, updateErpItemModel, updateDraftStatusModel, updateErpInvoicePaymentModel } = require("../repositories/invoiceRepository");
const { addCustomerModel, getCustomerByVatNumberModel, updateErpCustomerModel, getCustomerModel } = require("../repositories/CustomerRepository");
const { getErpCompanyDetails, makeUniqueSupplierOrCustomer } = require("../helpers/helpers");
const { DocumentAnalysisClient, AzureKeyCredential } = require("@azure/ai-form-recognizer");
const { uploadFile } = require("../helpers/helpers");


const baseURL = process.env.ERP_BASE_URL;
const apiErpKey = process.env.ERP_APIKEY;
const apiErpSecret = process.env.ERP_APISECRET;

exports.readInvoice = async (req, res) => {
  const endpoint = "https://softech.cognitiveservices.azure.com/";
  const apiKey = "1fa8e976815d46718f8bfce12cc4a5b1";
  const client = new DocumentAnalysisClient(endpoint, new AzureKeyCredential(apiKey));
  let rawBody = "";

  if (!req.files && req.query.type != "text") {
    return apiResponse(req, res, {}, 404, "Failed to read Invoice. No image uploaded.");
  }

  if (req.query.type == "text") {
    req.on("data", (chunk) => {
      rawBody += chunk.toString();
    });
    req.on("end", () => {
      if (rawBody == "") {
        return apiResponse(req, res, {}, 404, "Failed to read Invoice. No image uploaded.");
      }
      buffer = Buffer.from(rawBody, "base64");
      analyzeInvoice().catch((error) => {
        return apiResponse(req, res, {}, 404, error.details.error.innererror.message);
      });
    });
  }

  if (req.files) {
    analyzeInvoice().catch((error) => {
      return apiResponse(req, res, {}, 404, error.details.error.innererror.message);
    });
  }

  async function analyzeInvoice() {
    try {
      var file_to_be_read = req.query.type != "text" ? req.files.image.data : buffer;
      //   console.log(file_to_be_read);
      const poller = await client.beginAnalyzeDocument("prebuilt-invoice", file_to_be_read, {
        modelVersion: "2024-01-01", // Specify the 2024 model version
        onProgress: (state) => {
          console.log(`status: ${state.status}`);
        },
      });

      const { documents } = await poller.pollUntilDone();

      function roundToTwo(num) {
        return Math.round((num + Number.EPSILON) * 100) / 100;
      }

      var total_vat = 0;
      var sub_total_amount = 0;
      var total_discount = 0;

      // Function to process each item
      function processItem(item) {
        item = item.properties;
        var quantity = item.Quantity?.value || 1;
        var description = item.Description ? item.Description.value : "";
        var amount = item.Amount ? item.Amount.value.amount : 0;
        var unitPrice = item.UnitPrice ? item.UnitPrice?.value?.amount : roundToTwo(amount / quantity);
        var total = unitPrice != 0 ? roundToTwo(unitPrice * quantity) : 0;

        var tax = item.Tax?.value.amount ? item.Tax.value.amount : item.TaxRate?.value ? roundToTwo((parseFloat(item.TaxRate.value) * total) / 100) : 0;
        var product = {
          price: unitPrice,
          product_name: description,
          quantity: quantity,
          total_price: total != null ? total : amount,
          amount,
          vat_amount: tax,
          discount_amount: 0,
        };

        total_vat += product.vat_amount;
        total_discount += product.discount_amount;
        sub_total_amount += product.total_price;

        return product;
      }

      if (documents && documents.length > 0) {
        const invoice = documents[0];

        var invoiceObj = {
          invoice_date: invoice.fields.InvoiceDate ? invoice.fields.InvoiceDate.value : "",
          delivery_date: invoice.fields.DueDate ? invoice.fields.DueDate.value : "",
          invoice_number: invoice.fields.InvoiceId ? invoice.fields.InvoiceId.value : "",
          vat_number: invoice.fields.VendorTaxId ? invoice.fields.VendorTaxId.value : invoice.fields.CustomerTaxId ? invoice.fields.CustomerTaxId.value : "",
          name: invoice.fields?.VendorName?.value || invoice.fields?.CustomerName?.value || "",
          address: invoice.fields?.VendorAddress?.value?.amount || invoice.fields?.VendorAddress?.value?.house || invoice.fields?.CustomerAddressRecipient?.value || invoice.fields?.VendorAddressRecipient?.value || "",
          details: invoice.fields.Items ? invoice.fields.Items.values.map(processItem) : [],
          po_number: invoice.fields?.PurchaseOrder?.value || "",
          payment_mode: "",
          prepared_by: "",
          received_by: "",
          payment_status: "",
          //   total_amount: invoice.fields.InvoiceTotal ? invoice.fields.InvoiceTotal.value.amount : "",
          //   sub_total_amount: invoice.fields.SubTotal ? invoice.fields.SubTotal.value.amount : "",
          //   total_vat: invoice.fields.TotalTax ? invoice.fields.TotalTax.value.amount : "",
          //   total_discount: invoice.fields.TotalDiscount ? invoice.fields.TotalDiscount.value.amount : "",
          //   customer_id: invoice.fields.CustomerId ? invoice.fields.CustomerId.value : "",
          //   amount_due: invoice.fields.AmountDue ? invoice.fields.AmountDue.value.amount : "",
          //   iban: invoice.fields.PaymentDetails ? invoice.fields.PaymentDetails.values[0].properties.IBAN.value : "",
        };

        invoiceObj.total_vat = total_vat;
        invoiceObj.invoice_vat_amount = total_vat === 0 ? invoice.fields?.TotalTax?.value?.amount || 0 : 0;
        invoiceObj.total_discount = total_discount;
        invoiceObj.invoice_discount_amount = total_discount === 0 ? invoice.fields?.TotalDiscount?.value?.amount || 0 : 0;
        invoiceObj.sub_total_amount = sub_total_amount;
        invoiceObj.total_amount = roundToTwo(invoiceObj.sub_total_amount + invoiceObj.total_vat + invoiceObj.invoice_vat_amount - (invoiceObj.total_discount + invoiceObj.invoice_discount_amount));

        return apiResponse(req, res, invoiceObj, 200, "Invoice read successfully");
      } else {
        return apiResponse(req, res, {}, 200, "No invoice data found.");
      }
    } catch (error) {
      console.log(error);
      return apiResponse(req, res, {}, 404, error.details.error.innererror.message);
    }
  }
};

async function addOrUpdateItem(itemErpObj, req, res) {
  //const baseErpURL = baseURL;

  var instance = await axios.create({
    baseURL,
    auth: {
      username: apiErpKey,
      password: apiErpSecret,
    },
  });

  const params = {
    fields: JSON.stringify(["name"]),
    order_by: "name desc",
    limit: 1,
  };

  try {
    var update_erp_invoice = await addUpdateErpItemModel(itemErpObj);

    itemErpObj.item_code = `${update_erp_invoice}`;
    itemErpObj.item_name = `${itemErpObj.product_name}`;
    itemErpObj.item_group = "Products";
    const queryURL = `/api/resource/Item?filters=[["Item","item_code","=","${update_erp_invoice}"]]`;
    const response_item = await instance.get(queryURL);
    if (response_item.data.data.length == 0) {
      const get_erp_invoice = await instance.post("/api/resource/Item", itemErpObj);

      if (get_erp_invoice.data.data) {
        var update_erp_invoice = await updateErpItemModel(itemErpObj);
      }
      return itemErpObj;
    }
  } catch (error) {
    // console.error("Error adding items:", error.response ? error.response.data : error.message);
    // return apiResponse(req, res, response.data.data, 404, "Failed to Add Items in Erp");
    if (error.response) {
      console.error("Error adding items:", error.response.data);
      return apiResponse(req, res, error.response.data, 404, "Failed to Add Items in Erp");
    } else {
      console.error("Error adding items:", error.message);
      return apiResponse(req, res, error.message, 404, "Failed to Add Items in Erp");
    }
  }
}

async function addOrUpdateInvoice(invoiceErpObj, req, res) {
  var instance = await axios.create({
    baseURL,
    auth: {
      username: apiErpKey,
      password: apiErpSecret,
    },
  });
  ``;

  try {
    const response = await instance.post(req.body.type === "payables" ? "/api/resource/Purchase%20Invoice" : "/api/resource/Sales%20Invoice", invoiceErpObj);

    if (response.data.data) {
      await updateErpInvoiceModel({
        erp_id: response.data.data.name,
        id: invoiceErpObj.invoice_id,
      });

      return response.data.data;
    } else {
      return apiResponse(req, res, create_customer_response.data.data, 404, "Failed to Add Invoice in Erp");
    }
  } catch (error) {
    if (error.response) {
      console.error("Error adding invoice:", error.response.data?.exception);
      return apiResponse(req, res, error.response.data?.exception, 404, "Failed to Add Invoice in Erp");
    } else {
      console.error("Error adding invoice:", error.message);
      return apiResponse(req, res, error.message, 404, "Failed to Add Invoice in Erp");
    }
    // console.error("Error adding invoice:", error.response ? error.response.data : error.message);
    // return apiResponse(req, res, error?.response?.data, 404, "Failed to Add Invoice in Erp");
  }
}
async function addPaymentInvoiceEntry(paymentErpObj) {
  var instance = await axios.create({
    baseURL,
    auth: {
      username: apiErpKey,
      password: apiErpSecret,
    },
  });
  ``;

  // const params = {
  //   fields: JSON.stringify(["title"]),
  //   order_by: "title desc",
  //   limit: 1,
  // };
  try {
    console.log("payment Obj ", paymentErpObj);
    const response = await instance.post("/api/resource/Payment%20Entry", paymentErpObj);

    if (response.data.data) {
      await updateErpInvoicePaymentModel({
        erp_id: response.data.data.name,
        id: paymentErpObj.invoice_id,
      });

      return response.data.data;

      // const get_erp_payment = await instance.get("/api/resource/Payment%20Entry", { params });
      // const invoice_update_params = {
      //   erp_id: get_erp_payment.data.data[0].title,
      //   id: paymentErpObj.invoice_id,
      // };

      // var update_erp_invoice = await updateErpInvoiceModel(invoice_update_params);

      //return apiResponse(req, res, response.data.data, 200, "Invoice added successfully");
    } else {
      return apiResponse(req, res, {}, 404, "Failed to Add Payment Entry in Erp");
    }
  } catch (error) {
    // console.error("Error adding Payment Entry:", error.response ? error.response.data : error.message);
    // return apiResponse(req, res, response.data.data, 404, "Failed to Add Payment Entry in Erp");

    if (error.response) {
      console.error("Error adding Payment Entry 1:", error.response.data?.exception);
      return apiResponse(req, res, error.response.data?.exception, 404, "Failed to Add Payment Entry in Erp");
    } else {
      console.error("Error adding Payment Entry2:", error.message);
      return apiResponse(req, res, error.message, 404, "Failed to Add Payment Entry in Erp");
    }
  }
}

async function addOrUpdateSupplier(customerObj, req, res) {
  var instance = await axios.create({
    baseURL,
    auth: {
      username: apiErpKey,
      password: apiErpSecret,
    },
  });
  ``;

  const taxID = customerObj.vat_number;

  console.log("Supplier Tax_id ", taxID);
  const params = {
    fields: JSON.stringify(["*"]),
  };
  try {
    const queryURL = `/api/resource/Supplier?filters=[["Supplier","tax_id","=","${taxID}"]]`;
    const response = await instance.get(queryURL);
    console.log("Get Supplier response through tax_id ", response.data.data);
    console.log("Get Supplier object payload through tax_id ", customerObj);
    if (response.data.data.length == 0) {
      // check for supplier through name  to avoid throw duplicate entry from erp next error

      // const queryURL = `/api/resource/Supplier?filters=[["Supplier","name","=","${customerObj.supplier_name}"]]`;
      // const response_check_name = await instance.get(queryURL);

      // console.log("Response Supplier through name  ", response_check_name.data.data, customerObj.supplier_name);
      // if (response_check_name.data.data.length == 0) {
      // create unique name for supplier for erpNext

      const customer_name = await makeUniqueSupplierOrCustomer(customerObj, req, res);
      customerObj.supplier_name = customer_name.name;
      // const create_customer_response = await instance.post("/api/resource/Supplier", customerObj);
      // console.log("create_customer_response.data.data ", create_customer_response.data.data);
      // if (create_customer_response.data.data) {
      //   console.log("Supplier created successfully ", create_customer_response.data.data);
      //   var update_erp_details = await updateErpCustomerModel(create_customer_response.data.data.length > 0 ? create_customer_response.data.data.name : customerObj.supplier_name, customerObj.customer_id);
      var update_erp_details = await updateErpCustomerModel(customerObj.supplier_name, customerObj.customer_id);
      return customerObj.supplier_name;
      // }
      // } else {
      //   console.log("Supplier already exist through name ", response_check_name.data.data);
      //   var update_erp_details = await updateErpCustomerModel(response_check_name.data.data.length > 0 ? response_check_name.data.data[0].name : customerObj.supplier_name, customerObj.customer_id);
      //   return "success";
      // }
      //
      //upper valid comment
      //
      //  else {
      //   return apiResponse(req, res, create_customer_response.data.data, 404, "Failed to Add Supplier in Erp");
      // }
    } else {
      console.log("Supplier already exist through tax_id ", response.data.data[0].name);
      customerObj.supplier_name = response.data.data[0].name;
      var update_erp_details = await updateErpCustomerModel(response.data.data[0].name, customerObj.customer_id);
      return customerObj.supplier_name;
    }
  } catch (error) {
    if (error.response) {
      console.error("Error adding supplier:", error.response.data?.exception);
      return apiResponse(req, res, error.response.data?.exception, 404, "Failed to Add Supplier in Erp");
    } else {
      console.error("Error adding supplier:", error.message);
      return apiResponse(req, res, error.message, 404, "Failed to Add Supplier in Erp");
    }
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

  console.log("Customer Tax_id ", taxID);
  const params = {
    fields: JSON.stringify(["*"]),
  };
  try {
    const queryURL = `/api/resource/Customer?filters=[["Customer","tax_id","=","${taxID}"]]`;
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

exports.addInvoice = async (req, res) => {
  const invoiceDetails = {};
  for (const key in req.body) {
    const match = key.match(/invoice_details\[(\d+)\]\[(\w+)\]/);
    if (match) {
      const index = match[1];
      const field = match[2];

      // Ensure the object for this index exists
      if (!invoiceDetails[index]) {
        invoiceDetails[index] = {};
      }

      // Assign the field value to the object
      invoiceDetails[index][field] = req.body[key];
    }
  }

  // Convert the object to an array
  const invoiceDetailsArray = Object.values(invoiceDetails);
  req.body.invoice_details = invoiceDetailsArray;

  let file_uploaded = null;

  if (req.files !== undefined && req.files !== null) {
    file_uploaded = await uploadFile(req.files.invoice_file, "public/uploads", null);
  }

  var customerObj = {};
  req.body.company_id = req.user.super_parent_id ?? req.user.user_id;

  req.body.is_draft = parseInt(req.body.is_draft);

  if (req.body.customer_id === undefined) {
    if (req.body.name === undefined || req.body.address === undefined || req.body.vat_number === undefined) {
      return apiResponse(
        req,
        res,
        {},
        404,

        "Invalid vendor information. Please try again."
      );
    }
  }
  var Customer_detail;
  if (req.body.customer_id != undefined) {
    req.body.id = req.body.customer_id;
    Customer_detail = await getCustomerModel(req.body);
  } else {
    Customer_detail = await getCustomerByVatNumberModel(req.body);
  }

  console.log("local db customer detail ", Customer_detail);
  var erpCompanyResponse;
  var supplier_info;
  if (req.user.company_abbr == null) {
    erpCompanyResponse = await getErpCompanyDetails(req, res);
  }
  // console.log("create case company check ", erpCompanyResponse, req.user.company_abbr);
  var accountsItemsObj = [];
  var company_abbreviation = req.user.company_abbr == null ? erpCompanyResponse.abbr : req.user.company_abbr;
  var company_names = req.user.company_name == null ? erpCompanyResponse.name : req.user.company_name,
    customerObj = {
      customer_id: Customer_detail.length === 0 ? "" : Customer_detail[0].id,
      vat_number: req.body.customer_id === undefined ? req.body.vat_number : Customer_detail[0].vat_number,
      // supplier_name: req.body.customer_id === undefined ? req.body.name : Customer_detail[0].name,
      [req.body.type === "payables" || req.body.type === "expenses" ? "supplier_name" : "customer_name"]: req.body.customer_id === undefined ? req.body.name : Customer_detail[0].name,
      customer_type: req.user == 2 ? "Company" : "Individual",
      customer_or_supplier: req.body.type === "payables" || req.body.type === "expenses" ? "supplier" : "customer",
      mobile: req.body.mobile || "",
      tax_id: req.body.customer_id === undefined ? req.body.vat_number : Customer_detail[0].vat_number,
      phone: req.body.phone || "",
      email_id: req.user.email || "",
      company: company_names,
    };

  if (Customer_detail.length === 0) {
    // new create
    req.body.customer_or_supplier = req.body.type === "payables" || req.body.type === "expenses" ? "supplier" : "customer";
    var new_customer = await addCustomerModel(req.body);
    req.body.customer_id = new_customer;
    customerObj.customer_id = req.body.customer_id;

    if (req.body.is_draft !== 1) {
      if (customerObj.customer_or_supplier === "supplier") {
        supplier_info = await addOrUpdateSupplier(customerObj, req, res);

        // addOrUpdateSupplier(customerObj, req, res)
        //   .then((result) => {
        //     console.log("Supplier operation result:", result);
        //     // Handle success
        //   })
        //   .catch((error) => {
        //     return apiResponse(req, res, error.response ? error.response.data : error.message, 404, error);
        //   });
      } else {
        supplier_info = await addOrUpdateCustomer(customerObj, req, res);
        // addOrUpdateCustomer(customerObj, req, res)
        //   .then((result) => {
        //     console.log("Customer operation result:", result);
        //     // Handle success
        //   })
        //   .catch((error) => {
        //     return apiResponse(req, res, error.response ? error.response.data : error.message, 404, error);
        //   });
      }
    }
  } else {
    //already exist
    req.body.customer_id = Customer_detail[0].id;
    if (req.body.is_draft !== 1) {
      if (Customer_detail[0].erpnext_customer_id === null || Customer_detail[0].erpnext_customer_id === "") {
        // erp next customer

        if (customerObj.customer_or_supplier === "supplier") {
          supplier_info = await addOrUpdateSupplier(customerObj, req, res);

          // addOrUpdateSupplier(customerObj, req, res)
          //   .then((result) => {
          //     console.log("Supplier operation result:", result);
          //     // Handle success
          //   })
          //   .catch((error) => {
          //     return apiResponse(req, res, error.response ? error.response.data : error.message, 404, error);
          //   });
        } else {
          supplier_info = await addOrUpdateCustomer(customerObj, req, res);

          // addOrUpdateCustomer(customerObj, req, res)
          //   .then((result) => {
          //     console.log("Customer operation result:", result);
          //     // Handle success
          //   })
          //   .catch((error) => {
          //     return apiResponse(req, res, error.response ? error.response.data : error.message, 404, error);
          //   });
        }
      }
    }
  }
  customerObj[req.body.type === "payables" || req.body.type === "expenses" ? "supplier_name" : "customer_name"] = supplier_info == undefined ? Customer_detail[0].erpnext_customer_id : supplier_info;
  var add_invoice_id = await addInvoiceModel(req.body, file_uploaded);

  if (add_invoice_id.affectedRows === 0) {
    return apiResponse(req, res, {}, 404, "Failed to add Invoice. Please try again.");
  }

  var invoices_items = [];
  if (req.body.is_draft != 1) {
    var sum = 0.0;

    for (const invoice_detail of req.body.invoice_details) {
      // try {
      //erp next products
      //req.body.type === "expenses"

      if (req.body.type === "expenses") {
        var itemJournalErpObj = {
          account: `${invoice_detail.paid_to} - ${company_abbreviation}`,
          debit_in_account_currency: Math.round(parseFloat(invoice_detail.total_price)),
          credit_in_account_currency: 0,
          cost_center: `Main - ${company_abbreviation}`,
          user_remark: invoice_detail.product_name,
        };
        sum = Math.round(sum + parseFloat(invoice_detail.total_price));
        accountsItemsObj.push(itemJournalErpObj);
        if (invoice_detail.vat_amount > 0) {
          itemJournalErpObj = {
            account: `VAT - ${company_abbreviation}`,
            debit_in_account_currency: Math.round(parseFloat(invoice_detail.vat_amount)),
            credit_in_account_currency: 0,
            cost_center: `Main - ${company_abbreviation}`,
            user_remark: invoice_detail.product_name,
          };

          sum = Math.round(sum + parseFloat(invoice_detail.vat_amount));
          accountsItemsObj.push(itemJournalErpObj);
        }

        if (invoice_detail === req.body.invoice_details[req.body.invoice_details.length - 1]) {
          // added check here and add paid from if bank and cash and for not paid use creditors
          itemJournalErpObj = {
            account: req.body.paid_from === "not paid" ? `Creditors - ${company_abbreviation}` : req.body.paid_from,
            debit_in_account_currency: 0,
            credit_in_account_currency: Math.round(sum),
            party_type: "supplier",
            party: customerObj.supplier_name != undefined ? customerObj.supplier_name : supplier_info,
            cost_center: `Main - ${company_abbreviation}`,
          };

          accountsItemsObj.push(itemJournalErpObj);
          // Perform any specific operations for the last item
        }
      } else {
        var itemErpObj = {
          product_name: invoice_detail.product_name,
          price: invoice_detail.price,
          rate: invoice_detail.price,
          amount: invoice_detail.total_price,
          qty: invoice_detail.quantity,
        };
        const itemArray = await addOrUpdateItem(itemErpObj, req, res);
        invoices_items.push(itemErpObj);
      }
    }
    console.log("Total sum expense", Math.round(sum));
    if (req.body.type === "expenses") {
      console.log(" Journal Entry Object ", accountsItemsObj);
    }
  }

  var get_invoice_body = { id: add_invoice_id.insertId };

  var invoice_response = await editInvoiceModel(get_invoice_body);

  const discount_amount = parseFloat((parseFloat(req.body.total_discount) + parseFloat(req.body.invoice_discount_amount)).toFixed(2));

  const tax_amount = parseFloat((parseFloat(req.body.total_vat) + parseFloat(req.body.invoice_vat_amount)).toFixed(2));
  var erpInvoiceRes;
  if (req.body.is_draft != 1) {
    if (req.body.type != "expenses") {
      const invoiceErpObj = {
        invoice_id: add_invoice_id.insertId,
        id: add_invoice_id.insertId,
        items: invoices_items,
        invoice_type: req.body.type === "payables" ? "Purchase Invoice" : "Sale Invoice",
        [req.body.type === "payables" ? "supplier" : "customer"]: Customer_detail.length != 0 ? Customer_detail[0].erpnext_customer_id : req.body.type === "payables" ? customerObj.supplier_name : customerObj.customer_name,
        posting_date: invoice_response.length > 0 ? invoice_response[0].invoice_date : "",
        due_date: invoice_response.length > 0 ? invoice_response[0].delivery_date : "",
        status: "Submitted",
        apply_discount_on: "Net Total",
        total: invoice_response.length > 0 ? invoice_response[0].sub_total_amount : 0,
        grand_total: invoice_response.length > 0 ? invoice_response[0].total_amount : 0,
        discount_amount,
        company: company_names,
        docstatus: 1,
        taxes: [
          {
            charge_type: "Actual",
            account_head: `VAT - ${company_abbreviation}`,
            // account_head: `VAT - SP`,
            tax_amount,
            description: "VAT",
          },
        ],
      };
      console.log("invoice final obj ", invoiceErpObj);
      //erp next invoice

      erpInvoiceRes = await addOrUpdateInvoice(invoiceErpObj, req, res);
    }
  }

  //   Payment Entry section starts from here
  var isoDateString = new Date();
  var payment_date = isoDateString;
  var final_date = isoDateString;
  if (invoice_response.length > 0) {
    isoDateString = invoice_response[0].invoice_date;

    const year = payment_date.getUTCFullYear();
    const month = payment_date.getUTCMonth() + 1; // Months are zero-based, so add 1
    const day = payment_date.getUTCDate();
    final_date = `${year}-${month}-${day}`;
  }

  if (req.body.is_draft !== 1) {
    if (req.body.type != "expenses") {
      var paymentErpObj = {
        doctype: "Payment Entry",
        docstatus: 1,
        invoice_id: add_invoice_id.insertId,
        payment_type: req.body.type === "payables" ? "Pay" : "Receive",
        party_type: req.body.type === "payables" ? "Supplier" : "Customer",
        // party: req.body.customer_id === undefined ? req.body.name : Customer_detail.length != 0 ? Customer_detail[0].erpnext_customer_id : req.body.type === "payables" && customerObj.supplier_name != "" ? customerObj.supplier_name : req.body.name,
        party: Customer_detail.length != 0 ? Customer_detail[0].erpnext_customer_id : req.body.type === "payables" ? customerObj.supplier_name : customerObj.customer_name,
        paid_amount: erpInvoiceRes.base_rounded_total,
        received_amount: erpInvoiceRes.base_rounded_total,
        reference_date: final_date,
        reference_no: erpInvoiceRes.name,
        company: company_names,
        reference_no: "REF1234",
        cost_center: `Main - ${company_abbreviation}`,
        references: [
          {
            reference_doctype: req.body.type === "payables" ? "Purchase Invoice" : "Sales Invoice",
            reference_name: erpInvoiceRes.name,
            total_amount: erpInvoiceRes.base_rounded_total,
            outstanding_amount: erpInvoiceRes.base_rounded_total,
            allocated_amount: erpInvoiceRes.base_rounded_total,
          },
        ],
        mode_of_payment: "Cash",
        // mode_of_payment: req.body.payment_mode, ${company_abbreviation}
        // paid_to: req.body.type === "payables" ? `Creditors - ${company_abbreviation}` : `Cash - ${company_abbreviation}`,
        // paid_from: req.body.type === "payables" ? `Cash - ${company_abbreviation}` : `Debtors - ${company_abbreviation}`,
        // paid_to: req.body.type === "payables" ? `Creditors - SL` : `Cash - SL`,
        // paid_from: req.body.type === "payables" ? `Cash - SL` : `Debtors - SL`,
        paid_to: req.body.paid_to,
        paid_from: req.body.paid_from,
      };
      //erp
      addPaymentInvoiceEntry(paymentErpObj)
        .then((result) => {
          console.log("Payment Entry operation result:", result);
          return apiResponse(req, res, {}, 200, "Invoice and Payment Entry added successfully");
          // Handle success
        })
        .catch((error) => {
          return apiResponse(req, res, {}, 404, error);
        });
    } else {
      var currentDate = new Date();
      const year = currentDate.getUTCFullYear();
      const month = currentDate.getUTCMonth() + 1; // Months are zero-based, so add 1
      const day = currentDate.getUTCDate();
      var jornal_entry_date = `${year}-${month}-${day}`;
      //add journal entry  here
      var journalEntryObj = {
        posting_date: `${jornal_entry_date}`,
        invoice_id: add_invoice_id.insertId,
        doctype: "Journal Entry",
        docstatus: 1,
        company: company_names,
        accounts: accountsItemsObj,
        // [
        //   {
        //     account: "Debtors - SL", //  for customer case Debtors - SL otherwise creditors - SL
        //     debit_in_account_currency: 1000,
        //     credit_in_account_currency: 0,
        //     cost_center: `Main - ${company_abbreviation}`,
        //     party_type: "Supplier", // customer ||  Supplier
        //     party: req.body.customer_id === undefined ? req.body.name : Customer_detail[0].name,
        //   },
        //   {
        //     account: `Sales - ${company_abbreviation}`,
        //     debit_in_account_currency: 0,
        //     credit_in_account_currency: 1000,
        //     cost_center: `Main - ${company_abbreviation}`,
        //   },
        // ],
        // reference_type: "Sales Invoice",
        // reference_name: "SINV-0001",
      };

      var erpJournalEntryRes = await addJournalEntry(journalEntryObj, req, res);
      console.log("final jornal entry response ", journalEntryObj);
      if (erpJournalEntryRes.length != 0) {
        return apiResponse(req, res, {}, 200, "Invoice and Journal Entry added successfully");
      }
    }
  }
  if (add_invoice_id.affectedRows != 0 && req.body.is_draft == 1) {
    return apiResponse(req, res, {}, 200, "Add Invoice successfully");
  }
};

exports.deleteInvoice = async (req, res) => {
  var invoice = await deleteInvoiceModel(req.body);

  if (invoice.affectedRows > 0) {
    return apiResponse(req, res, {}, 200, "Invoice deleted successfully");
  }

  return apiResponse(req, res, {}, 500, "Something went wrong");
};

exports.editInvoice = async (req, res) => {
  var invoice = await editInvoiceModel(req.query);
  if (invoice.length === 0) {
    return apiResponse(req, res, {}, 200, "Invoices not found. Please try again.");
  }

  if (invoice.length > 0) {
    var invoice_detail = await editInvoiceDetailModel(req.query);
    invoice[0].details = invoice_detail;

    return apiResponse(req, res, invoice[0], 200, "Invoice found successfully");
  }

  return apiResponse(req, res, {}, 500, "Something went wrong");
};

exports.updateInvoice = async (req, res) => {
  const invoiceDetails = {};
  for (const key in req.body) {
    const match = key.match(/invoice_details\[(\d+)\]\[(\w+)\]/);
    if (match) {
      const index = match[1];
      const field = match[2];

      // Ensure the object for this index exists
      if (!invoiceDetails[index]) {
        invoiceDetails[index] = {};
      }

      // Assign the field value to the object
      invoiceDetails[index][field] = req.body[key];
    }
  }

  // Convert the object to an array
  const invoiceDetailsArray = Object.values(invoiceDetails);
  req.body.invoice_details = invoiceDetailsArray;
  req.body.is_draft = parseInt(req.body.is_draft);
  var getInvoice = await editInvoiceModel(req.body);
  if (getInvoice.length === 0) {
    return apiResponse(req, res, {}, 200, "Invoice does not exist.");
  }

  var invoice = await updateInvoiceModel(req.body);

  if (invoice.affectedRows === 0) {
    return apiResponse(req, res, {}, 500, "Something went wrong");
  }
  req.body.type = getInvoice[0].type;

  if (getInvoice[0].is_draft === 1 && req.body.is_draft === 0) {
    var customerObj = {};
    //updated information object
    getInvoice = await editInvoiceModel(req.body);
    req.body.id = req.body.customer_id;
    Customer_detail = await getCustomerModel(req.body);
    console.log("local db customer detail", Customer_detail);
    if (Customer_detail.length === 0) {
      return apiResponse(req, res, {}, 500, " Customer does not exist");
    }

    var erpCompanyResponse;
    var supplier_info;
    if (req.user.company_abbr == null) {
      erpCompanyResponse = await getErpCompanyDetails(req, res);
    }
    console.log("update invoice case ", erpCompanyResponse, req.user.company_abbr);
    var accountsItemsObj = [];
    var company_abbreviation = req.user.company_abbr == null ? erpCompanyResponse.abbr : req.user.company_abbr;
    var company_names = req.user.company_name == null ? erpCompanyResponse.name : req.user.company_name,
      customerObj = {
        customer_id: Customer_detail[0].id,
        vat_number: Customer_detail[0].vat_number,
        // supplier_name: req.body.customer_id === undefined ? req.body.name : Customer_detail[0].name,
        [getInvoice[0].type === "payables" || req.body.type === "expenses" ? "supplier_name" : "customer_name"]: Customer_detail[0].name,
        customer_type: req.user.role_id == 2 ? "Company" : "Individual",
        customer_or_supplier: getInvoice[0].type === "payables" || req.body.type === "expenses" ? "supplier" : "customer",
        mobile: Customer_detail[0].mobile || "",
        tax_id: Customer_detail[0].vat_number,
        phone: Customer_detail[0].phone || "",
        email_id: req.user.email || "",
        company: company_names,
      };

    if (Customer_detail.length === 0) {
      // new create
      req.body.customer_or_supplier = getInvoice[0].type === "payables" || req.body.type === "expenses" ? "supplier" : "customer";

      //customerObj.customer_id = req.body.customer_id;
      // if (req.body.is_draft !== 1) {
      if (customerObj.customer_or_supplier === "supplier") {
        supplier_info = await addOrUpdateSupplier(customerObj, req, res);
        // addOrUpdateSupplier(customerObj, req, res)
        //   .then((result) => {
        //     console.log("Supplier operation result:", result);
        //     // Handle success
        //   })
        //   .catch((error) => {
        //     return apiResponse(req, res, error.response ? error.response.data : error.message, 404, error);
        //   });
      } else {
        supplier_info = await addOrUpdateCustomer(customerObj, req, res);
        // addOrUpdateCustomer(customerObj, req, res)
        //   .then((result) => {
        //     console.log("Customer operation result:", result);
        //     // Handle success
        //   })
        //   .catch((error) => {
        //     return apiResponse(req, res, error.response ? error.response.data : error.message, 404, error);
        //   });
      }
      //   }
    } else {
      //already exist

      //   req.body.customer_id = Customer_detail[0].id;
      //if (req.body.is_draft !== 1) {
      if (Customer_detail[0].erpnext_customer_id === null || Customer_detail[0].erpnext_customer_id === "") {
        // erp next customer
        if (customerObj.customer_or_supplier === "supplier") {
          supplier_info = await addOrUpdateSupplier(customerObj, req, res);

          // addOrUpdateSupplier(customerObj, req, res)
          //   .then((result) => {
          //     console.log("Supplier operation result:", result);
          //     // Handle success
          //   })
          //   .catch((error) => {
          //     return apiResponse(req, res, error.response ? error.response.data : error.message, 404, error);
          //   });
        } else {
          supplier_info = await addOrUpdateCustomer(customerObj, req, res);

          // addOrUpdateCustomer(customerObj, req, res)
          //   .then((result) => {
          //     console.log("Customer operation result:", result);
          //     // Handle success
          //   })
          //   .catch((error) => {
          //     return apiResponse(req, res, error.response ? error.response.data : error.message, 404, error);
          //   });
        }
      }
      //  }
    }
    customerObj[req.body.type === "payables" || req.body.type === "expenses" ? "supplier_name" : "customer_name"] = supplier_info == undefined ? Customer_detail[0].erpnext_customer_id : supplier_info;

    var invoices_items = [];
    var sum = 0.0;
    for (const invoice_detail of req.body.invoice_details) {
      if (req.body.type === "expenses") {
        var itemJournalErpObj = {
          account: `${invoice_detail.paid_to} - ${company_abbreviation}`,
          debit_in_account_currency: Math.round(parseFloat(invoice_detail.total_price)),
          credit_in_account_currency: 0,
          cost_center: `Main - ${company_abbreviation}`,
          user_remark: invoice_detail.product_name,
        };
        sum = Math.round(sum + parseFloat(invoice_detail.total_price));
        accountsItemsObj.push(itemJournalErpObj);
        if (invoice_detail.vat_amount > 0) {
          itemJournalErpObj = {
            account: `VAT - ${company_abbreviation}`,
            debit_in_account_currency: Math.round(parseFloat(invoice_detail.vat_amount)),
            credit_in_account_currency: 0,
            cost_center: `Main - ${company_abbreviation}`,
            user_remark: invoice_detail.product_name,
          };

          sum = Math.round(sum + parseFloat(invoice_detail.vat_amount));
          accountsItemsObj.push(itemJournalErpObj);
        }

        if (invoice_detail === req.body.invoice_details[req.body.invoice_details.length - 1]) {
          // added check here and add paidfrom if bank and cash and for not paid use creditors
          itemJournalErpObj = {
            account: req.body.paid_from === "not paid" ? `Creditors - ${company_abbreviation}` : req.body.paid_from,
            debit_in_account_currency: 0,
            credit_in_account_currency: Math.round(sum),
            party_type: "supplier",
            party: customerObj.supplier_name,
            cost_center: `Main - ${company_abbreviation}`,
          };

          accountsItemsObj.push(itemJournalErpObj);
          // Perform any specific operations for the last item
        }
      } else {
        var itemErpObj = {
          product_name: invoice_detail.product_name,
          price: invoice_detail.price,
          rate: invoice_detail.price,
          amount: invoice_detail.total_price,
          qty: invoice_detail.quantity,
        };

        //erp next products
        const itemArray = await addOrUpdateItem(itemErpObj, req, res);

        invoices_items.push(itemErpObj);
      }
    }
    console.log("update summ ", Math.round(sum));
    if (req.body.type === "expenses") {
      console.log("update Journal Entry Object ", accountsItemsObj);
    }

    const discount_amount = parseFloat((parseFloat(getInvoice[0].total_discount) + parseFloat(getInvoice[0].invoice_discount_amount)).toFixed(2));

    const tax_amount = parseFloat((parseFloat(getInvoice[0].total_vat) + parseFloat(getInvoice[0].invoice_vat_amount)).toFixed(2));
    var erpInvoiceRes;
    if (req.body.type != "expenses") {
      const invoiceErpObj = {
        invoice_id: getInvoice[0].id,
        id: getInvoice[0].id,
        items: invoices_items,
        invoice_type: getInvoice[0].type === "payables" ? "Purchase Invoice" : "Sale Invoice",
        [getInvoice[0].type === "payables" ? "supplier" : "customer"]: getInvoice[0].type === "payables" ? Customer_detail[0].erpnext_customer_id : Customer_detail[0].erpnext_customer_id,
        posting_date: getInvoice.length > 0 ? getInvoice[0].invoice_date : "",
        due_date: getInvoice.length > 0 ? getInvoice[0].delivery_date : "",
        status: "Submitted",
        apply_discount_on: "Net Total",
        total: getInvoice.length > 0 ? getInvoice[0].sub_total_amount : 0,
        grand_total: getInvoice.length > 0 ? getInvoice[0].total_amount : 0,
        discount_amount,
        company: company_names,
        docstatus: 1,
        taxes: [
          {
            charge_type: "Actual",
            account_head: `VAT - ${company_abbreviation}`,
            // account_head: `VAT - SL`,
            tax_amount,
            description: "VAT",
          },
        ],
      };

      console.log("invoice final obj update case ", invoiceErpObj);

      //erp next invoice
      req.body.type = getInvoice[0].type;
      erpInvoiceRes = await addOrUpdateInvoice(invoiceErpObj, req, res);
    }
    //   Payment Entry section starts from here
    var isoDateString = new Date();
    var payment_date = isoDateString;
    var final_date = isoDateString;

    isoDateString = getInvoice[0].invoice_date;

    const year = payment_date.getUTCFullYear();
    const month = payment_date.getUTCMonth() + 1; // Months are zero-based, so add 1
    const day = payment_date.getUTCDate();
    final_date = `${year}-${month}-${day}`;
    if (req.body.type != "expenses") {
      var paymentErpObj = {
        doctype: "Payment Entry",
        docstatus: 1,
        invoice_id: getInvoice[0].id,
        payment_type: getInvoice[0].type === "payables" ? "Pay" : "Receive",
        party_type: getInvoice[0].type === "payables" ? "Supplier" : "Customer",
        party: Customer_detail[0].erpnext_customer_id,
        paid_amount: erpInvoiceRes.base_rounded_total,
        received_amount: erpInvoiceRes.base_rounded_total,
        reference_date: final_date,
        reference_no: "REF1234",
        cost_center: `Main - ${company_abbreviation}`,
        company: company_names,
        references: [
          {
            reference_doctype: getInvoice[0].type === "payables" ? "Purchase Invoice" : "Sales Invoice",
            reference_name: erpInvoiceRes.name,
            total_amount: erpInvoiceRes.base_rounded_total,
            outstanding_amount: erpInvoiceRes.base_rounded_total,
            allocated_amount: erpInvoiceRes.base_rounded_total,
          },
        ],
        mode_of_payment: "Cash",
        // mode_of_payment: req.body.payment_mode, ${company_abbreviation}
        // paid_to: req.body.type === "payables" ? `Creditors - ${company_abbreviation}` : `Cash - ${company_abbreviation}`,
        // paid_from: req.body.type === "payables" ? `Cash - ${company_abbreviation}` : `Debtors - ${company_abbreviation}`,
        // paid_to: req.body.type === "payables" ? `Creditors - SL` : `Cash - SL`,
        // paid_from: req.body.type === "payables" ? `Cash - SL` : `Debtors - SL`,
        paid_to: getInvoice[0].paid_to,
        paid_from: getInvoice[0].paid_from,
      };
      //erp
      const payment_result = await addPaymentInvoiceEntry(paymentErpObj)
        .then((result) => {
          console.log("Payment Entry operation result in update case:", result);
          return apiResponse(req, res, {}, 200, "Invoice and Payment Entry updated successfully");
          // Handle success
        })
        .catch((error) => {
          return apiResponse(req, res, error.response ? error.response.data : error.message, 404, error);
        });
    } else {
      var currentDate = new Date();
      const year = currentDate.getUTCFullYear();
      const month = currentDate.getUTCMonth() + 1; // Months are zero-based, so add 1
      const day = currentDate.getUTCDate();
      var jornal_entry_date = `${year}-${month}-${day}`;
      //add journal entry  here
      var journalEntryObj = {
        posting_date: `${jornal_entry_date}`,
        doctype: "Journal Entry",
        docstatus: 1,
        invoice_id: getInvoice[0].id,
        company: company_names,
        accounts: accountsItemsObj,
        // [
        //   {
        //     account: "Debtors - SL", //  for customer case Debtors - SL otherwise creditors - SL
        //     debit_in_account_currency: 1000,
        //     credit_in_account_currency: 0,
        //     cost_center: `Main - ${company_abbreviation}`,
        //     party_type: "Supplier", // customer ||  Supplier
        //     party: req.body.customer_id === undefined ? req.body.name : Customer_detail[0].name,
        //   },
        //   {
        //     account: `Sales - ${company_abbreviation}`,
        //     debit_in_account_currency: 0,
        //     credit_in_account_currency: 1000,
        //     cost_center: `Main - ${company_abbreviation}`,
        //   },
        // ],
        // reference_type: "Sales Invoice",
        // reference_name: "SINV-0001",
      };

      var erpJournalEntryRes = await addJournalEntry(journalEntryObj, req, res);
      console.log("final jornal entry response in update case", journalEntryObj, erpJournalEntryRes);
    }

    var updateInvoiceStatus = await updateDraftStatusModel(getInvoice[0]);
    if (updateInvoiceStatus.affectedRows > 0) {
      return apiResponse(req, res, {}, 200, "Invoice updated successfully");
    }
    return apiResponse(req, res, {}, 500, "Something went wrong");
  }

  return apiResponse(req, res, {}, 200, "Invoice updated successfully");
};

exports.listInvoices = async (req, res) => {


  var page = parseInt(req.body.page) || 1;
  var limit = parseInt(req.body.limit) || 10;
  var company_id = req.user.super_parent_id ?? req.user.user_id;
  var from_date = req.body.from_date;
  var to_date = req.body.to_date;
  var is_draft = req.body.is_draft;
  var min_amount = req.body.min_amount;
  var type = req.body.type;
  var max_amount = req.body.max_amount;
  var vendor = req.body.vendor;
  var payment_mode = req.body.payment_mode;
  var sort_column = req.body.sort_column || "i.id";
  var sort_order = req.body.sort_order || "DESC";
  const params = {
    page: page,
    limit: limit,
    type: type,
    company_id: company_id,
    skip: (page - 1) * limit,
    from_date: from_date,
    to_date: to_date,
    is_draft: is_draft,
    min_amount: min_amount,
    max_amount: max_amount,
    vendor: vendor,
    payment_mode: payment_mode,
    sort_column: sort_column,
    sort_order: sort_order,
  };

  var invoice = await listInvoicesModel(params);

  const baseURL = process.env.APP_BASE_URL;

  invoice.records = invoice.records.map((item) => {
    if (item.invoice_file) {
      item.invoice_file = `${baseURL}/public/uploads/${item.invoice_file}`;
    }
    return item;
  });

  if (invoice.length === 0) {
    return apiResponse(req, res, {}, 200, "Invoices not found. Please try again.");
  }

  return apiResponse(req, res, invoice, 200, "Success");
};

// exports.listInvoices = async (req, res) => {
//   var page = parseInt(req.body.page) || 1;
//   var limit = parseInt(req.body.limit) || 10;
//   var company_id = req.user.super_parent_id ?? req.user.user_id;
//   var from_date = req.body.from_date;
//   var to_date = req.body.to_date;
//   var is_draft = req.body.is_draft;
//   var min_amount = req.body.min_amount;
//   var type = req.body.type;
//   var max_amount = req.body.max_amount;
//   var vendor = req.body.vendor;
//   var payment_mode = req.body.payment_mode;
//   var sort_column = req.body.sort_column || "i.id";
//   var sort_order = req.body.sort_order || "DESC";
//   const params = {
//     page: page,
//     limit: limit,
//     type: type,
//     company_id: company_id,
//     skip: (page - 1) * limit,
//     from_date: from_date,
//     to_date: to_date,
//     is_draft: is_draft,
//     min_amount: min_amount,
//     max_amount: max_amount,
//     vendor: vendor,
//     payment_mode: payment_mode,
//     sort_column: sort_column,
//     sort_order: sort_order,
//   };
//
//   var invoice = await listInvoicesModel(params);
//
//   const baseURL = process.env.APP_BASE_URL;
//
//   invoice.records = invoice.records.map((item) => {
//     if (item.invoice_file) {
//       item.invoice_file = `${baseURL}/public/uploads/${item.invoice_file}`;
//     }
//     return item;
//   });
//
//   if (invoice.length === 0) {
//     return apiResponse(req, res, {}, 200, "Invoices not found. Please try again.");
//   }
//
//   return apiResponse(req, res, invoice, 200, "Success");
// };
exports.generalLedgerReport = async (req, res) => {
  var instances = await axios.create({
    baseURL,
    auth: {
      username: apiErpKey,
      password: apiErpSecret,
    },
  });
  ``;
  var erpCompanyResponse;
  if (req.user.company_name == null) {
    erpCompanyResponse = await getErpCompanyDetails(req, res);
  }
  try {
    const report_object = {
      report_name: "General Ledger",
      filters: {
        company: req.user.company_name == null ? erpCompanyResponse.name : req.user.company_name,
        from_date: req.body.from_date,
        to_date: req.body.to_date,
        account: [],
        party: [],
        group_by: "Group by Voucher (Consolidated)",
        cost_center: [],
        project: [],
        include_dimensions: 1,
        include_default_book_entries: 1,
      },
    };
    var get_reports = await instances.get("/api/method/frappe.desk.query_report.run", { data: report_object });
    console.log(get_reports);
    if (get_reports.data) {
      return apiResponse(req, res, get_reports.data.message, 200, "Success");
    } else {
      return apiResponse(req, res, get_reports.data, 404, "Failed to get general ledger report from Erp");
    }
  } catch (error) {
    console.error("Error adding ledger report:", error.response ? error.response.data : error.message);
    return apiResponse(req, res, error.response, 404, "Failed to get general ledger report from Erp");
  }
};
exports.erpPaymentModes = async (req, res) => {
  var instances = await axios.create({
    baseURL,
    auth: {
      username: apiErpKey,
      password: apiErpSecret,
    },
  });
  ``;

  const params = {
    fields: JSON.stringify(["*"]),
  };
  try {
    const queryURL = `/api/resource/Mode%20of%20Payment`;
    const response = await instances.get(queryURL, { params });
    if (response.data.data) {
      return apiResponse(req, res, response.data.data, 200, "Success");
    }
  } catch (error) {
    console.error("Error adding payment modes:", error.response ? error.response.data : error.message);
    return apiResponse(req, res, error.response.data, 404, "No PaymentMode found.");
  }
};
exports.erpAddCustomer = async (req, res) => {
  const baseURL = "https://softechsystems.erpnext.com";
  const instance = await axios.create({
    baseURL,
    auth: {
      username: "59374d77bc8fa24",
      password: "1f85ed1c38e1454",
    },
  });
  ``;

  // Customer data to be added it can be dynamic
  // const customerData = {
  //   customer_name: "nasir khan12",
  //   customer_type: "Individual",
  //   email_id: "nasir.doe@example.com",
  //   tax_id: 234,
  //   phone: "0334394827",
  //   // Add more fields as per your ERPNext Customer doctype structure
  // };
  const taxID = "234";
  const params = {
    fields: JSON.stringify(["*"]),
    // filters: {
    //   tax_id: taxID,
    // },
  };
  try {
    const queryURL = `/api/resource/Customer?filters=[["Customer","tax_id","=","${taxID}"]]`;
    //const response = await instance.post("/api/resource/Customer", customerData);
    const response = await instance.get(queryURL, { params });
    //console.log("Customer added successfully:", response.data.data[2].name);
    if (response.data.data) {
      return apiResponse(req, res, response.data.data, 200, "Customers added successfully");
    }
  } catch (error) {
    console.error("Error adding customer:", error.response ? error.response.data : error.message);
    return apiResponse(req, res, error.response.data, 404, "Failed to Add Customer");
  }
};

exports.getProfitLossReports = async (req, res) => {
  var instances = await axios.create({
    baseURL,
    auth: {
      username: apiErpKey,
      password: apiErpSecret,
    },
  });
  ``;

  console.log("token user ", req.user);
  var erpCompanyResponse;
  if (req.user.company_name == null) {
    erpCompanyResponse = await getErpCompanyDetails(req, res);
  }
  console.log("company check ", erpCompanyResponse, req.user);
  try {
    const { filter_based_on, period_start_date, period_end_date, from_fiscal_year, to_fiscal_year, periodicity, selected_view } = req.body;

    const profit_loss_object = {
      report_name: "Profit and Loss Statement",
      filters: {
        company: req.user.company_name == null ? erpCompanyResponse.name : req.user.company_name,
        filter_based_on,
        period_start_date,
        period_end_date,
        from_fiscal_year,
        to_fiscal_year,
        periodicity,
        cost_center: [],
        project: [],
        selected_view,
        accumulated_values: 1,
        include_default_book_entries: 1,
      },
    };
    var get_reports = await instances.get("/api/method/frappe.desk.query_report.run", { data: profit_loss_object });
    if (get_reports.data) {
      return apiResponse(req, res, get_reports.data.message, 200, "Success");
    } else {
      return apiResponse(req, res, get_reports.data, 404, "Failed to get Profit And Loss report from Erp");
    }
  } catch (error) {
    if (error.response) {
      console.error("Error getting Profit And Loss Report:", error.response.data?.exception);
      return apiResponse(req, res, error.response.data?.exception, 404, "Failed to get Profit And Loss report from Erp");
    } else {
      console.error("Error getting Profit And Loss Report:", error.message);
      return apiResponse(req, res, error.message, 404, "Failed to get  Profit And Loss report from Erp");
    }
  }
};
exports.getBalanceSheetReports = async (req, res) => {
  var instances = await axios.create({
    baseURL,
    auth: {
      username: apiErpKey,
      password: apiErpSecret,
    },
  });
  ``;
  var erpCompanyResponse;
  if (req.user.company_name == null) {
    erpCompanyResponse = await getErpCompanyDetails(req, res);
  }
  try {
    const { filter_based_on, period_start_date, period_end_date, from_fiscal_year, to_fiscal_year, periodicity, selected_view } = req.body;
    const balance_sheet_object = {
      report_name: "Balance Sheet",
      filters: {
        company: req.user.company_name == null ? erpCompanyResponse.name : req.user.company_name,
        filter_based_on,
        period_start_date,
        period_end_date,
        from_fiscal_year,
        to_fiscal_year,
        periodicity,
        cost_center: [],
        project: [],
        selected_view,
        accumulated_values: 1,
        include_default_book_entries: 1,
      },
    };
    var get_reports = await instances.get("/api/method/frappe.desk.query_report.run", { data: balance_sheet_object });
    if (get_reports.data) {
      return apiResponse(req, res, get_reports.data.message, 200, "Success");
    } else {
      return apiResponse(req, res, get_reports.data?.exception, 404, "Failed to get Balance Sheet report from Erp");
    }
  } catch (error) {
    if (error.response) {
      console.error("Error getting Balance Sheet Report:", error.response.data);
      return apiResponse(req, res, error.response.data?.exception, 404, "Failed to get Balance Sheet report from Erp");
    } else {
      console.error("Error getting Balance Sheet Report:", error.message);
      return apiResponse(req, res, error.message, 404, "Failed to get  Balance Sheet report from Erp");
    }
  }
};
exports.getCashFlowReports = async (req, res) => {
  var instances = await axios.create({
    baseURL,
    auth: {
      username: apiErpKey,
      password: apiErpSecret,
    },
  });
  ``;
  var erpCompanyResponse;
  if (req.user.company_name == null) {
    erpCompanyResponse = await getErpCompanyDetails(req, res);
  }
  try {
    const { filter_based_on, period_start_date, period_end_date, from_fiscal_year, to_fiscal_year, periodicity, selected_view } = req.body;

    const cash_flow_object = {
      report_name: "Cash Flow",
      filters: {
        company: req.user.company_name == null ? erpCompanyResponse.name : req.user.company_name,
        filter_based_on,
        period_start_date,
        period_end_date,
        from_fiscal_year,
        to_fiscal_year,
        periodicity,
        cost_center: [],
        project: [],
        selected_view,
        accumulated_values: 1,
        include_default_book_entries: 1,
      },
    };
    var get_reports = await instances.get("/api/method/frappe.desk.query_report.run", { data: cash_flow_object });
    if (get_reports.data) {
      return apiResponse(req, res, get_reports.data.message, 200, "Success");
    } else {
      return apiResponse(req, res, get_reports.data, 404, "Failed to get Cash Flow report from Erp");
    }
  } catch (error) {
    if (error.response) {
      console.error("Error getting Cash Flow Report:", error.response.data);
      return apiResponse(req, res, error.response.data, 404, "Failed to get Cash Flow report from Erp");
    } else {
      console.error("Error getting Cash Flow Report:", error.message);
      return apiResponse(req, res, error.message, 404, "Failed to get  Cash Flow report from Erp");
    }
  }
};
exports.getTrialBalanceReports = async (req, res) => {
  var instances = await axios.create({
    baseURL,
    auth: {
      username: apiErpKey,
      password: apiErpSecret,
    },
  });
  ``;
  var erpCompanyResponse;
  if (req.user.company_name == null) {
    erpCompanyResponse = await getErpCompanyDetails(req, res);
  }
  try {
    const { fiscal_year, from_fiscal_year, to_fiscal_year } = req.body;
    const trial_balance_object = {
      report_name: "Trial Balance",
      filters: {
        company: req.user.company_name == null ? erpCompanyResponse.name : req.user.company_name,
        // fiscal_year: "2024-2025",
        // from_date: "2024-07-01",
        // to_date: "2025-06-30",
        fiscal_year: fiscal_year,
        from_date: from_fiscal_year,
        to_date: to_fiscal_year,
        with_period_closing_entry_for_opening: 1,
        with_period_closing_entry_for_current_period: 1,
        include_default_book_entries: 1,
        show_net_values: 1,
      },
    };
    var get_reports = await instances.get("/api/method/frappe.desk.query_report.run", { data: trial_balance_object });
    if (get_reports.data) {
      return apiResponse(req, res, get_reports.data.message, 200, "Success");
    } else {
      return apiResponse(req, res, get_reports.data, 404, "Failed to get Trial Balance report from Erp");
    }
  } catch (error) {
    if (error.response) {
      console.error("Error getting Trial Balance Report:", error.response.data);
      return apiResponse(req, res, error.response.data, 404, "Failed to get Trial Balance report from Erp");
    } else {
      console.error("Error getting Trial Balance Report:", error.message);
      return apiResponse(req, res, error.message, 404, "Failed to get  Trial Balance report from Erp");
    }
  }
};

exports.ListErpChartOfAccounts = async (req, res) => {
  var instances = await axios.create({
    baseURL,
    auth: {
      username: apiErpKey,
      password: apiErpSecret,
    },
  });
  ``;
  var erpCompanyResponse;
  if (req.user.company_name == null) {
    erpCompanyResponse = await getErpCompanyDetails(req, res);
  }
  const params = {
    limit_page_length: 1000000,
    fields: JSON.stringify(["*"]),
    filters:
      req.query.is_group != undefined
        ? JSON.stringify([
            ["is_group", "=", req.query.is_group],
            ["company", "=", req.user.company_name == null ? erpCompanyResponse.name : req.user.company_name],
          ])
        : JSON.stringify([["company", "=", req.user.company_name == null ? erpCompanyResponse.name : req.user.company_name]]),
  };

  try {
    const queryURL = `/api/resource/Account`;
    const response = await instances.get(queryURL, { params });
    if (response.data.data) {
      return apiResponse(req, res, response.data.data, 200, "Success");
    }
  } catch (error) {
    console.error("Error fetching group chart of accounts:", error.response ? error.response.data : error.message);
    return apiResponse(req, res, error.response.data, 404, "No chart of accounts found.");
  }
};

exports.addErpChartOfAccounts = async (req, res) => {
  var instance = await axios.create({
    baseURL,
    auth: {
      username: apiErpKey,
      password: apiErpSecret,
    },
  });
  ``;
  var erpCompanyResponse;
  if (req.user.company_name == null) {
    erpCompanyResponse = await getErpCompanyDetails(req, res);
  }
  const accountData = {
    account_name: req.body.account_name,
    parent_account: req.body.parent_account, // Make sure this parent account exists in your ERPNext
    account_type: req.body.account_type,
    company: req.user.company_name == null ? erpCompanyResponse.name : req.user.company_name, // Replace with your company name
    is_group: 0, // 0 for a ledger account, 1 for a group or parent account
  };
  try {
    const response = await instance.post("/api/resource/Account", accountData);

    if (response.data.data) {
      return apiResponse(req, res, response.data.data, 200, "Success");
    } else {
      return apiResponse(req, res, response.data.data, 404, "Failed to Add chart of accounts in Erp");
    }
  } catch (error) {
    if (error.response) {
      console.error("Error adding chart of accounts:", error.response.data);
      return apiResponse(req, res, error.response.data, 404, "Failed to Add chart of accounts in Erp");
    } else {
      console.error("Error adding chart of accounts:", error.message);
      return apiResponse(req, res, error.message, 404, "Failed to Add chart of accounts in Erp");
    }
  }
};

exports.addFiscalYear = async (req, res) => {
  var instance = await axios.create({
    baseURL,
    auth: {
      username: apiErpKey,
      password: apiErpSecret,
    },
  });
  ``;
  var erpCompanyResponse;
  if (req.user.company_name == null) {
    erpCompanyResponse = await getErpCompanyDetails(req, res);
  }

  const fiscalYearData = {
    year: req.body.year,
    year_start_date: req.body.year_start_date,
    year_end_date: req.body.year_end_date,
    is_fiscal_year_closed: 0, // 0 for not closed, 1 for closed
    is_short_year: 1,
    company: req.user.company_name == null ? erpCompanyResponse.name : req.user.company_name,
    companies: [
      {
        company: req.user.company_name == null ? erpCompanyResponse.name : req.user.company_name,
      },
    ],
  };
  try {
    const response = await instance.post("/api/resource/Fiscal Year", fiscalYearData);

    if (response.data.data) {
      return apiResponse(req, res, response.data.data, 200, "Success");
    } else {
      return apiResponse(req, res, response.data.data, 404, "Failed to Add fiscal year in Erp");
    }
  } catch (error) {
    if (error.response) {
      console.error("Error adding fiscal year:", error.response.data);
      return apiResponse(req, res, error.response.data, 404, "Failed to Add fiscal year in Erp");
    } else {
      console.error("Error adding fiscal year:", error.message);
      return apiResponse(req, res, error.message, 404, "Failed to Add fiscal year in Erp");
    }
  }
};

exports.ListErpFiscalYear = async (req, res) => {
  var instances = await axios.create({
    baseURL,
    auth: {
      username: apiErpKey,
      password: apiErpSecret,
    },
  });
  ``;
  var erpCompanyResponse;
  if (req.user.company_name == null) {
    erpCompanyResponse = await getErpCompanyDetails(req, res);
  }
  const params = {
    fields: JSON.stringify(["*"]),
    // filters: JSON.stringify([["Fiscal Year", "company", "=", "systems limited"]]),
  };

  try {
    const queryURL = `/api/resource/Fiscal Year`;
    const response = await instances.get(queryURL, { params });
    if (response.data.data) {
      return apiResponse(req, res, response.data.data, 200, "Success");
    }
  } catch (error) {
    console.error("Error fetching group fiscal years:", error.response ? error.response.data : error.message);
    return apiResponse(req, res, error.response.data, 404, "No fiscal years found.");
  }
};

exports.deleteErpFiscalYear = async (req, res) => {
  var instance = await axios.create({
    baseURL,
    auth: {
      username: apiErpKey,
      password: apiErpSecret,
    },
  });
  ``;
  var erpCompanyResponse;
  if (req.user.company_name == null) {
    erpCompanyResponse = await getErpCompanyDetails(req, res);
  }

  const fiscalYearName = req.query.name;
  try {
    const response = await instance.delete(`/api/resource/Fiscal Year/${fiscalYearName}`);

    if (response.data) {
      return apiResponse(req, res, response.data.data, 200, "Success");
    } else {
      return apiResponse(req, res, response.data.data, 404, "Failed to Delete fiscal year in Erp");
    }
  } catch (error) {
    if (error.response) {
      console.error("Error deleting fiscal year:", error.response.data);
      return apiResponse(req, res, error.response.data, 404, "Failed to Delete fiscal year in Erp");
    } else {
      console.error("Error deleting fiscal year:", error.message);
      return apiResponse(req, res, error.message, 404, "Failed to Delete fiscal year in Erp");
    }
  }
};

exports.addFinanceBook = async (req, res) => {
  var instance = await axios.create({
    baseURL,
    auth: {
      username: apiErpKey,
      password: apiErpSecret,
    },
  });
  ``;
  // var erpCompanyResponse;
  // if (req.user.company_name == null) {
  //   erpCompanyResponse = await getErpCompanyDetails(req, res);
  // }

  const financeBookData = {
    finance_book_name: req.body.finance_book_name, // Replace with the desired finance book name
    // company: "systems limited", // Replace with the actual company name
    is_default: 1,
  };
  try {
    const response = await instance.post("/api/resource/Finance Book", financeBookData);

    if (response.data.data) {
      return apiResponse(req, res, response.data.data, 200, "Success");
    } else {
      return apiResponse(req, res, response.data.data, 404, "Failed to Add Finance Book in Erp");
    }
  } catch (error) {
    if (error.response) {
      console.error("Error adding Finance Book:", error.response.data);
      return apiResponse(req, res, error.response.data, 404, "Failed to Add Finance Book in Erp");
    } else {
      console.error("Error adding Finance Book:", error.message);
      return apiResponse(req, res, error.message, 404, "Failed to Add Finance Book in Erp");
    }
  }
};

exports.editChartOfAccountDetail = async (req, res) => {
  var instance = await axios.create({
    baseURL,
    auth: {
      username: apiErpKey,
      password: apiErpSecret,
    },
  });
  ``;
  var erpCompanyResponse;
  if (req.user.company_name == null) {
    erpCompanyResponse = await getErpCompanyDetails(req, res);
  }

  try {
    const account_name = `${req.query.accountName} - ${req.user.abbr == null ? erpCompanyResponse.abbr : req.user.abbr}`;
    const response = await instance.get(`/api/resource/Account/${account_name}`);

    if (response.data) {
      return apiResponse(req, res, response.data.data, 200, "Success");
    } else {
      return apiResponse(req, res, response.data.data, 404, "Failed to get chart of account in Erp");
    }
  } catch (error) {
    if (error.response) {
      if (error.response.status === 404) {
        return apiResponse(req, res, {}, 404, "No chart of account exist in Erp");
      }
      console.error("Error getting chart of account:", error.response.data);
      return apiResponse(req, res, error.response.data, 404, "Failed to get chart of account in Erp");
    } else {
      console.error("Error getting chart of account:", error.message);
      return apiResponse(req, res, error.message, 404, "Failed to get chart of account in Erp");
    }
  }
};

exports.updateChartOfAccount = async (req, res) => {
  var instance = await axios.create({
    baseURL,
    auth: {
      username: apiErpKey,
      password: apiErpSecret,
    },
  });
  ``;
  var erpCompanyResponse;
  if (req.user.company_name == null) {
    erpCompanyResponse = await getErpCompanyDetails(req, res);
  }

  try {
    const account_name = `${req.query.accountName}`;

    const updateData = {
      account_name: `${req.body.account_name}`,
      is_group: 0,
      // parent_account: `${req.body.parent_account} - ${req.user.abbr == null ? erpCompanyResponse.abbr : req.user.abbr}`,
      parent_account: `${req.body.parent_account}`,
      account_type: req.body.account_type,
    };

    const response = await instance.put(`/api/resource/Account/${req.query.accountName}`, updateData);

    if (response.data) {
      return apiResponse(req, res, response.data?.data, 200, "Success");
    } else {
      return apiResponse(req, res, response.data?.data, 404, "Failed to update chart of account in Erp");
    }
  } catch (error) {
    if (error.response) {
      if (error.response.status === 404) {
        console.log("Error ", error.response?.data);
        return apiResponse(req, res, error.response?.data, 404, "No chart of account exist in Erp");
      }
      console.error("Error update chart of account:", error.response?.data);
      return apiResponse(req, res, error.response?.data, 404, "Failed to update chart of account in Erp");
    } else {
      console.error("Error update chart of account:", error.message);
      return apiResponse(req, res, error.message, 404, "Failed to update chart of account in Erp");
    }
  }
};

exports.addJournalEntry12 = async (req, res) => {
  var instance = await axios.create({
    baseURL,
    auth: {
      username: apiErpKey,
      password: apiErpSecret,
    },
  });
  ``;
  var erpCompanyResponse;
  if (req.user.company_name == null) {
    erpCompanyResponse = await getErpCompanyDetails(req, res);
  }

  //payload

  // {
  //   "posting_date": "2024-08-12",
  //   "doctype": "Journal Entry",
  // docstatus: 1,
  //   "accounts": [
  //       {
  //           "account": "Debtors - SL",          //  for customer case otherwise creditors - SL
  //           "debit_in_account_currency": 1000,
  //           "credit_in_account_currency": 0,
  //           "cost_center": "Main - SL",
  //            "party_type": "Customer",
  //           "party": "أصول"
  //       },
  //       {
  //           "account": "Sales - SL",
  //           "debit_in_account_currency": 0,
  //           "credit_in_account_currency": 1000,
  //           "cost_center": "Main - SL"
  //       }
  //   ],
  //   "reference_type": "Sales Invoice",
  //   "reference_name": "SINV-0001"
  // }

  const JournalEntryData = {
    posting_date: "2024-08-12",
    doctype: "Journal Entry",
    docstatus: 1,
    accounts: [
      {
        account: "Debtors - SL", //  for customer case Debtors - SL otherwise creditors - SL
        debit_in_account_currency: 1000,
        credit_in_account_currency: 0,
        cost_center: `Main - ${company_abbreviation}`,
        party_type: "Customer", // customer ||  Supplier
        party: "أصول",
      },
      {
        account: `Sales - ${company_abbreviation}`,
        debit_in_account_currency: 0,
        credit_in_account_currency: 1000,
        cost_center: `Main - ${company_abbreviation}`,
      },
    ],
    reference_type: "Sales Invoice",
    reference_name: "SINV-0001",
  };
  try {
    const response = await instance.post("/api/resource/Journal Entry", JournalEntryData);

    if (response.data.data) {
      await updateErpInvoiceModel({
        erp_id: response.data.data.name,
        id: invoiceErpObj.invoice_id,
      });

      return response.data.data;
    } else {
      return apiResponse(req, res, response.data.data, 404, "Failed to Add Journal Entry in Erp");
    }
  } catch (error) {
    if (error.response) {
      console.error("Error adding Journal Entry:", error.response.data.exception);
      return apiResponse(req, res, error.response.data.exception, 404, "Failed to Add Journal Entry in Erp");
    } else {
      console.error("Error adding Journal Entry:", error.message);
      return apiResponse(req, res, error.message, 404, "Failed to Add Journal Entry in Erp");
    }
  }
};
async function addJournalEntry(journalEntryObj, req, res) {
  var instance = await axios.create({
    baseURL,
    auth: {
      username: apiErpKey,
      password: apiErpSecret,
    },
  });
  ``;
  var erpCompanyResponse;
  if (req.user.company_name == null) {
    erpCompanyResponse = await getErpCompanyDetails(req, res);
  }

  try {
    const response = await instance.post("/api/resource/Journal Entry", journalEntryObj);

    if (response.data.data) {
      await updateErpInvoiceModel({
        erp_id: response.data.data.name,
        id: journalEntryObj.invoice_id,
      });

      return response.data.data;
    } else {
      return apiResponse(req, res, response.data.data, 404, "Failed to Add Journal Entry in Erp");
    }
  } catch (error) {
    if (error.response) {
      console.error("Error adding Journal Entry:", error.response.data.exception);
      return apiResponse(req, res, error.response.data.exception, 404, "Failed to Add Journal Entry in Erp");
    } else {
      console.error("Error adding Journal Entry:", error.message);
      return apiResponse(req, res, error.message, 404, "Failed to Add Journal Entry in Erp");
    }
  }
}

exports.ListJournalEntry = async (req, res) => {
  var instances = await axios.create({
    baseURL,
    auth: {
      username: apiErpKey,
      password: apiErpSecret,
    },
  });
  ``;
  var erpCompanyResponse;
  if (req.user.company_name == null) {
    erpCompanyResponse = await getErpCompanyDetails(req, res);
  }
  console.log("com", req.user.company_name == null ? erpCompanyResponse.name : req.user.company_name);
  const params = {
    limit_page_length: 1000000,
    fields: JSON.stringify(["*"]),
    filters: JSON.stringify([["company", "=", req.user.company_name == null ? erpCompanyResponse.name : req.user.company_name]]),
    // req.query.is_group != undefined
    //   ? JSON.stringify([
    //       ["is_group", "=", req.query.is_group],
    //       ["company", "=", req.user.company_name == null ? erpCompanyResponse.name : req.user.company_name],
    //     ])
    //  : JSON.stringify([["company", "=", req.user.company_name == null ? erpCompanyResponse.name : req.user.company_name]]),
  };

  try {
    const queryURL = `/api/resource/Journal Entry`;
    const response = await instances.get(queryURL, { params });
    if (response.data.data) {
      return apiResponse(req, res, response.data.data, 200, "Success");
    }
  } catch (error) {
    console.error("Error fetching Journal Entry:", error.response ? error.response.data : error.message);
    return apiResponse(req, res, error.response.data, 404, "No Journal Entry found.");
  }
};
