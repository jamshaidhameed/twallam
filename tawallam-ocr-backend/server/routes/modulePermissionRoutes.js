const express = require("express");
const router = express.Router();
const { loginRequired, validate } = require("@base/middleware");
const {
    loginSchema,
    addPermissionSchema,
    deletePermissionSchema,
    updatePermissionSchema
} = require("@base/validation");
const { login } = require("@controllers/AuthController");
const { addPermission, listPermissions, listRoles,updateRoles,editRole ,deleteRole} = require("@controllers/ModulePermissionController");

router.route("/admin/listPermissions").post(listPermissions);
router
    .route("/admin/module-permission")
    // .get(loginRequired, controller.get)
    // .post(loginRequired, validate(addPermissionSchema), addPermission)
    .post(loginRequired, validate(addPermissionSchema),  addPermission);
router.route("/admin/listRoles").post(listRoles);
router.route("/admin/updateRoles").post(loginRequired,validate(updatePermissionSchema),updateRoles);
router.route("/admin/editRole").get(loginRequired,editRole);
router.route("/admin/deleteRole").delete(loginRequired,validate(deletePermissionSchema),deleteRole);

    // .put(adminRequired, validate(configurationsSchema), controller.update);

module.exports = router;
