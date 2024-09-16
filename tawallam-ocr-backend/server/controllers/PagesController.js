const { apiResponse } = require("@utils");
const { pagesValidation, editpageValidation, delete_pagesValidation, getPagelidate, sectionValidation } = require("../helpers/PagesValidation");
const { uploadFile } = require("../helpers/helpers");
const { PagesModel, editpageModel, delete_pagesModel, listpagesModel, listPagesModel, getPageRepo, getSections } = require("../repositories/pageRespository");

exports.cms_pages = async (req, res) => {
    console.log('req,', req.body);
    console.log('req.files,', req.files);
  const { error } = pagesValidation(req.body);
  if (error) {
    apiResponse(req, res, {}, 404, error.details[0].message);
  }


  let file_uploaded = null;
  const { name, title, long_description, name_ar, title_ar, long_description_ar, section_id } = req.body;

  if (req.files !== undefined && req.files !== null){
    file_uploaded = await uploadFile(req.files.image,'public/uploads', null);
  }

  console.log('file_uploaded',file_uploaded)
  const page = await PagesModel( name, title, long_description, name_ar, title_ar, long_description_ar, section_id, file_uploaded );

  if (page.length === 0) {
    return apiResponse(req, res, {}, 404, "Failed To Add Page");
  }
  return apiResponse(req, res, {}, 200, "Page Add Successfully");
};

exports.edit_pages = async (req, res) => {

  console.log('req',req.body);


  const { error } = editpageValidation(req.body);
  if (error) {
    return apiResponse(req, res, {}, 404, error.details[0].message);
  }
  var Edit = await editpageModel(req.body);
  if (Edit.length === 0) {
    return apiResponse(req, res, {}, 404, "Failed to Edit Page");
  }
  return apiResponse(req, res, {}, 200, "Page Edited Successfully");
};

exports.delete_pages = async (req, res) => {
  const { error } = delete_pagesValidation(req.body);

  if (error) {
    return helpers.apiResponse(req, res, {}, 404, error.details[0].message);
  }
  var remove = await delete_pagesModel(req.body);

  if (remove.length === 0) {
    return apiResponse(req, res, {}, 404, "Failed to Page Delete");
  }
  return apiResponse(req, res, {}, 404, "Page Deleted Successfully");
};

exports.list_pages = async (req, res) => {
  const payload = req.query;
  //   console.log(payload);

  var list = await listPagesModel(payload);

  if (list.length === 0) {
    return apiResponse(req, res, {}, 404, "No Page List Found.");
  }
  return apiResponse(req, res, list, 200, "Success");
};

exports.get_page = async (req, res) => {
  const payload = req.query;
  const { error } = getPagelidate(payload);

  if (error) {
    return apiResponse(req, res, {}, 500, error.details[0].message);
  }
  const response = await getPageRepo(payload);
  if (response.length === 0) {
    return apiResponse(req, res, [], 200, "Record Not Exist");
  } else {
    return apiResponse(req, res, response, 200, "Record Found");
  }
};

exports.getSectionDetail = async (req, res) => {
  const payload = req.query;
  const { error } = sectionValidation(payload);

  if (error) {
    return apiResponse(req, res, {}, 500, error.details[0].message);
  }
  let sectionDetail = await getPageRepo(payload);

  if (sectionDetail.length === 0) {
    return apiResponse(req, res, [], 200, "Record Not Exist");
  } else {

    sectionDetail = sectionDetail[0];

    if (sectionDetail.image != null){
      sectionDetail.image = `${process.env.APP_BASE_URL}/public/uploads/${sectionDetail.image}`
    }

    return apiResponse(req, res, sectionDetail, 200, "Record Found");
  }
};


exports.getSections = async (req, res) => {

    const sections = await getSections();
    return apiResponse(req, res, sections, 200, "Record Found");

};
