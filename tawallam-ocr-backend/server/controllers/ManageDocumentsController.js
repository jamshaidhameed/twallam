const { apiResponse } = require("@utils");
const path = require("path");
const fs = require("fs");
const {
  addDocument,
  listDocument,
  editDocument,
  getDocumentById,
  updateDocument,
  deleteDocument,
  changeDocumentStatusModel
} = require("../repositories/ManageDocumentsRepository");
// const {changeStatusModel} = require("@repositories/authRepository");
// const {editSubAdminModel} = require("@repositories/subAdminRepository");
const sendEmail = require("@services/mail");

exports.add_document = async (req, res) => {
  try {
    req.body.company_id = req.user.super_parent_id ?? req.user.user_id;
    const { company_id, title, description } = req.body;
    const file = req.files?.file;

    const timestamp = Date.now();
    const originalName = file.name;
    const filename = `${timestamp}-${originalName}`;
    const uploadPath = path.join(process.cwd(), "public/files", filename);

    if (!fs.existsSync(path.join(process.cwd(), "public/files"))) {
      fs.mkdirSync(path.join(process.cwd(), "public/files"), {
        recursive: true,
      });
    }

    await new Promise((resolve, reject) => {
      file.mv(uploadPath, (err) => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });

    const filePath = `public/files/${filename}`;

    const document = await addDocument(title, company_id, filePath, filename, description);

    return apiResponse(req, res, {}, 200, "Document added successfully");
  } catch (err) {
    console.error(err);

    return apiResponse(req, res, {}, 500, { message: err.message });
  }
};
exports.list_document = async (req, res) => {
  try {
    var page = parseInt(req.body.page) || 1;
    var limit = parseInt(req.body.limit) || 10;
    var company_id = req.user.super_parent_id ?? req.user.user_id;

    const params = {
      page: page,
      limit: limit,
      company_id: company_id,
      skip: (page - 1) * limit,
    };

    const { documents, totalRecordsCount } = await listDocument(params);

    if (documents.length === 0) {
      return apiResponse(
        req,
        res,
        {
          records: [],
          total_records: 0,
        },
        200,
        "No Records Found."
      );
    }

    const response = {
      records: documents,
      total_records: totalRecordsCount,
    };

    return apiResponse(req, res, response, 200, "Document get successfully");
  } catch (err) {
    console.error(err);

    return apiResponse(req, res, {}, 500, { message: err.message });
  }
};

exports.edit_document = async (req, res) => {
  try {
    const { id } = req.params;

    const document = await editDocument(id);
    console.log('document',document);

    if (!document) {
      return apiResponse(
        req,
        res,
        {},
        404,
        "Documents not found. Please try again."
      );
    }

    return apiResponse(
      req,
      res,
      document,
      200,
      "Document details retrieved successfully"
    );
  } catch (err) {
    console.error(err);
    return apiResponse(req, res, {}, 500, { message: err.message });
  }
};

exports.update_document = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;
    const file = req.files?.file;
    const company_id = req.user.super_parent_id ?? req.user.user_id;

    const existingDocument = await getDocumentById(id);

    if (!existingDocument) {
      return apiResponse(
        req,
        res,
        {},
        404,
        "Documents not found. Please try again."
      );
    }

    let filePath = existingDocument.file_path;
    let filename = existingDocument.file_name;

    if (file) {
      const oldFilePath = path.join(process.cwd(), existingDocument.file_path);
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }

      const timestamp = Date.now();
      const originalName = file.name;
      filename = `${timestamp}-${originalName}`;
      filePath = path.join("public/files", filename);

      const uploadDir = path.join(process.cwd(), "public/files");
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      await new Promise((resolve, reject) => {
        file.mv(path.join(uploadDir, filename), (err) => {
          if (err) {
            return reject(err);
          }
          resolve();
        });
      });
    }

    await updateDocument(id, title, company_id, filePath, filename, description);

    return apiResponse(req, res, {}, 200, "Document updated successfully");
  } catch (err) {
    console.error(err);
    return apiResponse(req, res, {}, 500, { message: err.message });
  }
};

exports.delete_document = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(id);
    const document = await deleteDocument(id);

    if (!document) {
      return apiResponse(
        req,
        res,
        {},
        404,
        "Documents not found. Please try again."
      );
    }
    console.log(document);
    return apiResponse(req, res, {}, 200, "Document delete successfully");
  } catch (err) {
    console.error(err);
    return apiResponse(req, res, {}, 500, { message: err.message });
  }
};

exports.delete_document = async (req, res) => {
  try {
    const { id } = req.params;

    const existingDocument = await getDocumentById(id);

    if (!existingDocument) {
      return apiResponse(
        req,
        res,
        {},
        404,
        "Documents not found. Please try again."
      );
    }

    const deleteResult = await deleteDocument(id);

    if (deleteResult === 0) {
      return apiResponse(
        req,
        res,
        {},
        404,
        "Documents not found. Please try again."
      );
    }

    const filePath = path.join(process.cwd(), existingDocument.file_path);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    return apiResponse(req, res, {}, 200, "Document deleted successfully");
  } catch (err) {
    console.error(err);
    return apiResponse(req, res, {}, 500, { message: err.message });
  }
};

exports.updateDocumentStatus = async (req, res) => {

  var status = await changeDocumentStatusModel(req.body);

  if (status[0].affectedRows > 0) {

    return apiResponse(req, res, {}, 200, "Document status updated successfully");
  }
  return apiResponse(req, res, {}, 500, "Something went wrong");
};
