const { addPermission } = require("../repositories/ModulePermissionRepository");
const { checkAndGenerateUniqueCompanyName, updateErpCompanyDetails, checkAndGenerateUniqueCustomerName } = require("../repositories/authRepository");
const { updateErpCustomerModel } = require("../repositories/CustomerRepository");
const axios = require("axios");
const fs = require("fs");
const { apiResponse } = require("@utils");

async function uploadFileToS3(files, name) {
  var imageFile = files[name];
  if (files[name] == undefined) {
    if (!files.name) {
      throw new Error("Image file not found in request.");
    } else {
      imageFile = files;
    }
  }

  if (!imageFile) {
    throw new Error("Image file not found in request.");
  }

  // Generate dynamic file name with timestamp and original name
  const timestamp = new Date().getTime();
  const originalFileName = imageFile.name;
  var fileName = `images/${timestamp}_${originalFileName}`;
  // Upload image to S3
  const params = {
    Bucket: bucketName,
    Key: fileName,
    Body: imageFile.data, // Assuming 'image' is a Buffer or a readable stream
  };
  var uploadResponse = await s3.upload(params).promise();
  var s3Key = uploadResponse.Key;
  return s3Key;
}

function getUserRole(user) {
  //console.log('uuser role',user)
  return new Promise(async (resolve, reject) => {
    var user_role = "";
    const [role] = await promisePool.query("SELECT name FROM roles where id = ?", [user.role_id]);
    user_role = role.length > 0 ? role[0].name : "";
    resolve(user_role);
  });
}

async function getSuperParent(parent_id) {
  return new Promise(async (resolve, reject) => {
    const [user] = await promisePool.query("SELECT * FROM users where id = ?", [parent_id]);

    if (user[0].parent_id != null) {
      await getSuperParent(user[0].parent_id);
    }
    resolve(user);
  });
}

async function uploadFile(file, dirPath = "", old_file_name) {
  const file_name = file.name;

  // const path = `../public/${dirPath}/${file_name}`;

  // let base_path = '';

  console.log("base_path", base_path);

  // if (process.env.NODE_ENV ==='development')
  //   base_path = '../base/public';   // For Development Environment
  // else
  //   base_path = '../public';  //For Production Environment

  // const path = `${process.env.APP_BASE_URL}/${dirPath}/${file_name}`;
  const path = `${base_path}/${dirPath}/${file_name}`;
  console.log("path", path);
  const old_file_path = `${base_path}/${dirPath}/${old_file_name}`;

  return new Promise(async (resolve, reject) => {
    file.mv(path, function (err) {
      if (!err) {
        //check that old file exists in folder or not

        //fs.R_OK:  check for read permission
        fs.access(old_file_path, fs.R_OK, (err) => {
          if (!err) {
            console.log("file exists");

            //delete old file from folder
            // fs.unlink(old_file_path, (err) => {
            //   if (!err) {
            //     console.log('file deleted');
            //   }
            // })
          }
        });
        resolve(file_name);
      }
      resolve(false);
    });
  });
}

async function getSuperParentId(user) {
  let parent_id;
  let user_role = await getUserRole(user);

  if (user_role === "super admin" || user_role === "company") {
    parent_id = user.user_id;
  } else {
    const [parent_user] = await getSuperParent(user.user_id);

    parent_id = parent_user.id;
    user_role = await getUserRole(parent_user);
  }

  return { parent_id, user_role };
}

async function createErpNextCompany(req, res, user) {
  console.log('user',user)
  const baseURL = process.env.ERP_BASE_URL;
  var instance = await axios.create({
    baseURL,
    auth: {
      username: process.env.ERP_APIKEY,
      password: process.env.ERP_APISECRET,
    },
  });
  ``;

  try {
    //var companyName = user[0].company_name || user[0].name;
    const params = {
      company_name: user[0].company_name || user[0].name,
      doctype: "Company",
    };

    var is_valid_company_name;

    console.log('params',params)
    while (true) {
      var is_valid_company_name = await checkAndGenerateUniqueCompanyName(params, user[0].id);

      if (is_valid_company_name !== "1") {
        var words = params.company_name.split(" ");
        var firstLetters = words.map((word) => word.charAt(0).toUpperCase());
        var finalAbbr = firstLetters.join("");
        const response_check = await instance.get(`/api/resource/Company`, {
          params: {
            filters: JSON.stringify([["Company", "abbr", "=", finalAbbr]]),
          },
        });
        if (response_check.data && response_check.data.data && response_check.data.data.length > 0) {
          params.company_name = `${params.company_name} 1`;
        } else {
          break;
        }
      } else {
        const newCompanyName = `${params.company_name} 1`;
        params.company_name = newCompanyName;
      }
    }

    const company_obj = {
      doctype: "Company",
      company_name: params.company_name,
      // default_currency: "PKR",
      //   country: "Saudi Arabia",
      default_currency: "SAR",
      country: "Saudi Arabia",
    };
    const response = await instance.post("/api/resource/Company", company_obj);

    if (response.data.data) {
      const update_erp_params = {
        id: user[0].id,
        erpnext_company_name: response.data.data.name,
        erpnext_company_abbr: response.data.data.abbr,
      };
      var updateErpDetails = await updateErpCompanyDetails(update_erp_params);
      if (updateErpDetails.affectedRows > 0) {
        const accountData = {
          account_name: "VAT",
          parent_account: `Tax Assets - ${response.data.data.abbr}`, // Make sure this parent account exists in your ERPNext
          company: response.data.data.name, // Replace with your company name
          is_group: 0, // 0 for a ledger account, 1 for a group or parent account
        };
        const response_account = await instance.post("/api/resource/Account", accountData);
      }
      return response.data.data;
    }
  } catch (error) {
    if (error.response) {
      console.error("Error adding Company:", error.response.data?.exception);
      return apiResponse(req, res, error.response.data?.exception, 404, "Failed to Add Company in Erp");
    } else {
      console.error("Error adding Company:", error.message);
      return apiResponse(req, res, error.message, 404, "Failed to Add Company in Erp");
    }
  }
}

async function getErpCompanyDetails(req, res) {
  return new Promise(async (resolve, reject) => {
    const [user] = await promisePool.query("SELECT * FROM users where id = ?", [req.user.user_id]);

    if (user[0].erpnext_company_name === null || user[0].erpnext_company_name === "") {
      var result = await createErpNextCompany(req, res, user);
      resolve(result);
    }
    const user_info = { name: user[0].erpnext_company_name, abbr: user[0].erpnext_company_abbr };
    resolve(user_info);
  });
}

async function makeUniqueSupplierOrCustomer(customer, req, res) {
  return new Promise(async (resolve, reject) => {
    const [user] = await promisePool.query("SELECT * FROM customers  where id = ?", [customer.customer_id]);
    var user_info;
    if (user[0].erpnext_customer_id === null || user[0].erpnext_customer_id === "") {
      var result = await createErpNextCustomer(req, res, user, customer);
      user_info = { name: result };
      resolve(user_info);
    }
    user_info = { name: user[0].erpnext_customer_id };
    resolve(user_info);
  });
}

async function createErpNextCustomer(req, res, user, customer) {
  const baseURL = process.env.ERP_BASE_URL;
  var instance = await axios.create({
    baseURL,
    auth: {
      username: process.env.ERP_APIKEY,
      password: process.env.ERP_APISECRET,
    },
  });
  ``;

  try {
    var finalName;
    var count = 0;
    var params = {
      customer_name: req.body.type === "payables" || req.body.type === "expenses" ? customer.supplier_name : customer.customer_name,
    };

    console.log("supplier in helper before loop ", customer.supplier_name, params.customer_name);
    finalName = req.body.type === "payables" || req.body.type === "expenses" ? params.customer_name : params.customer_name;
    while (true) {
      var is_valid_customer_name = await checkAndGenerateUniqueCustomerName(params, user[0].id);

      if (is_valid_customer_name !== "1") {
        // already customer exist

        const queryURL = req.body.type === "payables" || req.body.type === "expenses" ? `/api/resource/Supplier?filters=[["Supplier","name","=","${finalName}"]]` : `/api/resource/Customer?filters=[["Customer","name","=","${finalName}"]]`;
        const response_check = await instance.get(queryURL);

        if (response_check.data && response_check.data.data && response_check.data.data.length > 0) {
          if (count == 0) {
            finalName = `${finalName}-${customer.tax_id}`;
          } else {
            finalName = `${finalName}-${count}`;
          }
        } else {
          break;
        }
      } else {
        // new customer

        if (count == 0) {
          finalName = `${finalName}-${customer.tax_id}`;
        } else {
          finalName = `${finalName}-${count}`;
        }
      }
      params.customer_name = finalName;

      count = count + 1;
    }

    customer[req.body.type === "payables" || req.body.type === "expenses" ? "supplier_name" : "customer_name"] = params.customer_name;

    const create_customer_response = await instance.post(req.body.type === "payables" || req.body.type === "expenses" ? `/api/resource/Supplier` : `/api/resource/Customer`, customer);

    if (create_customer_response.data.data) {
      var update_erp_details = await updateErpCustomerModel(params.customer_name, customer.customer_id);
      if (update_erp_details.affectedRows > 0) {
        return params.customer_name;
      } else {
        return params.customer_name;
      }
    }
  } catch (error) {
    if (error.response) {
      console.error("Error adding Customer:", error.response.data?.exception);
      return apiResponse(req, res, error.response.data?.exception, 404, "Failed to Add Customer in Erp");
    } else {
      console.error("Error adding Customer:", error.message);
      return apiResponse(req, res, error.message, 404, "Failed to Add Customer in Erp");
    }
  }
}

async function getStringWithoutAbbreviation(inputString) {
  return new Promise(async (resolve, reject) => {
    console.log("node js ");
    // Find the index of the hyphen
    const hyphenIndex = inputString.indexOf("-");

    // Check if the hyphen exists in the string
    if (hyphenIndex !== -1) {
      // Extract the substring before the hyphen
      //  const beforeHyphen = inputString.substring(0, hyphenIndex).trim();
      const beforeHyphen = inputString.substring(0, hyphenIndex);
      //  return beforeHyphen;
      resolve(beforeHyphen);
    } else {
      // If no hyphen exists, return the entire string or a message
      //  return inputString;
      resolve(inputString);
    }
  });
}

const getSixDigitCode = () => {
  //generate 6 digit random number
  const min = 100000;
  const max = 999999;

  return Math.floor(Math.random() * (max - min + 1)) + min;
};

module.exports = {
  getSuperParentId,
  uploadFile,
  createErpNextCompany,
  getErpCompanyDetails,
  getSixDigitCode,
  getStringWithoutAbbreviation,
  makeUniqueSupplierOrCustomer,
};
