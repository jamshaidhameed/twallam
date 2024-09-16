const express = require("express");
const router = express.Router();
const { loginRequired, validate,userTokenMiddleware } = require("@base/middleware");
const {
    addSubAdminSchema,
    editSubAdminSchema,
    deleteSubAdminSchema,
    updateSubAdminSchema,
} = require("@base/validation");
const { editUser,addUser,listUsers ,deleteUser,updateUser} = require("@controllers/SubAdminController");


router.route("/addUser").post(validate(addSubAdminSchema),userTokenMiddleware, addUser);
router.route("/updateUser").post(validate(updateSubAdminSchema),userTokenMiddleware, updateUser);
router.route("/deleteUser").delete(validate(deleteSubAdminSchema),userTokenMiddleware, deleteUser);
router.route("/editUser").get(userTokenMiddleware, editUser);
router.route("/listUsers").post(userTokenMiddleware, listUsers);


module.exports = router;
