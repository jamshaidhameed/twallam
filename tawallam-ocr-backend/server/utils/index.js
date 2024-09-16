const path = require("path");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const { getCurrentTimeUnix } = require("./datetime");
const config = require("@config");
const logger = require("@base/logger");

const validateImage = (files) => {
  const allowed_extensions = ["jpg", "jpeg", "png", "bmp", "gif", "svg", "webp"];
  const extension = path.extname(files.profile_picture.name).toLowerCase().replace(".", "");

  if (!allowed_extensions.includes(extension)) {
    return `Profile picture can be of following type: ${allowed_extensions.toString()}`;
  }

  return "";
};

const apiResponse = (req, res, data, code, message) => {
  if (req == undefined) throw Error("req is required");
  if (res == undefined) throw Error("res is required");
  if (data == undefined) throw Error("data is required");
  if (code == undefined) throw Error("code is required");
  if (message == undefined) throw Error("message is required");

  let path = req.path;
  if (!path.includes("api")) path = `/${config.apiPrefix}${req.path}`;
  const action = path.replace("/", "");

  var data = {
    action,
    meta: {
      code,
      message,
    },
    data,
  };

  return res.status(200).json(data);
};

const getSixDigitCode = () => {
  //generate 6 digit random number
  const min = 100000;
  const max = 999999;

  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const createHash = async (value) => {
  return await bcrypt.hash(value, 10);
};

const requestFilled = (body, property) => {
  //Check if property exists in request body and not empty
  if (body.hasOwnProperty([property]) && body[property] !== "") {
    return true;
  }
  return false;
};

function getFileUrl(file, dirPath) {
  return `${web_base_path}/${dirPath}/${file}`;
}

async function uploadFile(file, dirPath = "", unique_name = false, old_file_name) {
  const file_name = unique_name === false ? file.name : `${datetime.getCurrentTimeUnix()}${file.name}`;

  const old_file_path = `../public/${dirPath}/${old_file_name}`;
  // const path = `../public/${dirPath}/${file_name}`;

  let base_path = "";

  if (process.env.NODE_ENV === "Development") base_path = "../ocr_backend/public"; // For Development Environment
  else base_path = "../public"; //For Production Environment

  const path = `${base_path}/${dirPath}/${file_name}`;

  return new Promise(async (resolve, reject) => {
    //mv function default path: C:\laragon\www\ocr_backend\nodejs //root of Node Js project
    file.mv(path, function (err) {
      if (!err) {
        //check that old file exists in folder or not

        //fs.R_OK:  check for read permission
        fs.access(old_file_path, fs.R_OK, (err) => {
          if (!err) {
            console.log("file exists");

            //delete old file from folder
            fs.unlink(old_file_path, (err) => {
              if (!err) {
                console.log("file deleted");
              }
            });
          }
        });
        resolve(file_name);
      }
      resolve(false);
    });
  });
}

// async function uploadFile(file, dirPath = "", unique_name = false, old_file_name) {
//   const file_name = unique_name === false ? file.name : `${file.name}`;
//   // console.log(file_name);

//   const old_file_path = `../public/${dirPath}/${old_file_name}`;
//   // const path = `../public/${dirPath}/${file_name}`;

//   let base_path = `C:\laragon/www/cr-backend/server/${dirPath}`;

//   //   if (process.env.NODE_ENV === "Development") base_path = "../base/public"; // For Development Environment
//   //   else base_path = "../public"; //For Production Environment
//   console.log(base_path);
//   const path = `${base_path}/${dirPath}/${file_name}`;

//   return new Promise(async (resolve, reject) => {
//     //mv function default path: C:\laragon\www\Stage\nodejs //root of Node Js project
//     file.mv(path, function (err) {
//       if (!err) {
//         //check that old file exists in folder or not

//         //fs.R_OK:  check for read permission
//         fs.access(old_file_path, fs.R_OK, (err) => {
//           if (!err) {
//             console.log("file exists");

//             //delete old file from folder
//             fs.unlink(old_file_path, (err) => {
//               if (!err) {
//                 console.log("file deleted");
//               }
//             });
//           }
//         });
//         resolve(file_name);
//       }
//       resolve(false);
//     });
//   });
// }

// const uploadFile = async (file, dirPath = "", unique_name = false, old_file_name = null) => {
//   let old_file_path = null;
//   const file_name = unique_name === false ? file.name : `${getCurrentTimeUnix()}${file.name}`;

//   if (old_file_name !== null) {
//     old_file_path = `${dirPath}/${old_file_name}`;
//   }

//   const path = `${dirPath}/${file_name}`;

//   return new Promise(async (resolve, reject) => {
//     file.mv(path, (err) => {
//       if (!err) {
//         if (old_file_path !== null) {
//           //check that old file exists in folder or not

//           //fs.R_OK:  check for read permission
//           fs.access(old_file_path, fs.R_OK, (err) => {
//             logger.warn(`File upload error:`, err);
//             if (!err) {
//               logger.warn("File exists");

//               //delete old file from folder
//               fs.unlink(old_file_path, (err) => {
//                 if (!err) logger.info("File deleted");
//               });
//             }
//           });
//         }
//         resolve(file_name);
//       }
//       resolve(false);
//     });
//   });
// };

const appendZero = (value) => {
  return value < 10 ? `0${value}` : value;
};

const resolveQueryOptions = (payload) => {
  const { limit, page, sortBy = "createdAt:desc" } = payload;

  // sorting
  const sort = {};
  const sortStr = sortBy.split(":");
  sort[sortStr[0]] = sortStr[1] === "desc" ? -1 : 1;

  // pagination
  const pageSize = limit ? parseInt(limit) : null;
  const skip = page && pageSize ? (parseInt(page) - 1) * pageSize : null;

  return { sort, pageSize, skip };
};

module.exports = {
  validateImage,
  apiResponse,
  getSixDigitCode,
  createHash,
  requestFilled,
  uploadFile,
  appendZero,
  resolveQueryOptions,
  getFileUrl,
};
