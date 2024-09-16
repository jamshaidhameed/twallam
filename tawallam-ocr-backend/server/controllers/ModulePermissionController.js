const { apiResponse } = require("@utils");
const { addRole, addPermission, listPermissionModel, listRolesModel, updateRole, updatePermission, editPermissionModel, getModulePermissionListModel, deleteRoleModel, deleteRolePermissionModel } = require("../repositories/ModulePermissionRepository");

exports.addPermission = async (req, res) => {
  const { data: permissions, role_name } = req.body;
  const [role] = await addRole(role_name, req.user.role_id === 1 || req.user.super_parent_id === 1 ? null : req.user.super_parent_id || req.user.user_id);
  const permission_keys = Object.keys(permissions);

  await Promise.all(
    permission_keys.map(async (key) => {
      const permission = await addPermission(role.id, key, permissions[key]);
    })
  );

  return apiResponse(req, res, {}, 200, "Permission added successfully");
};

exports.listPermissions = async (req, res) => {
  var modules = await listPermissionModel(req.body);

  if (modules.length === 0) {
    return apiResponse(req, res, {}, 404, "No Permission List Found.");
  }
  return apiResponse(req, res, modules, 200, "Success");
};

exports.listRoles = async (req, res) => {
  var roles = await listRolesModel(req.body, req.user.role_id);

  if (roles.length === 0) {
    return apiResponse(req, res, {}, 404, "No Roles List Found.");
  }
  return apiResponse(req, res, roles, 200, "Success");
};

exports.updateRoles = async (req, res) => {
  const { data: permissions, role_name, role_id } = req.body;
  const [role] = await updateRole(role_name, role_id);

  const permission_keys = Object.keys(permissions);

  await Promise.all(
    permission_keys.map(async (key) => {
      var permission = await updatePermission(role.id, key, permissions[key]);

      if (permission.affectedRows === 0) {
        var permission = await addPermission(role.id, key, permissions[key]);
      }
    })
  );

  return apiResponse(req, res, {}, 200, "Permission added successfully");
};

exports.editRole = async (req, res) => {
  if (!req.query.role_id) {
    return apiResponse(req, res, {}, 404, "role_id is required.");
  }

  var modules = await editPermissionModel(req.query.role_id);

  if (modules.length === 0) {
    return apiResponse(req, res, {}, 404, "No Permission Found.");
  }

  var permissions = await getModulePermissionListModel(req.query.role_id);
  modules[0].permissions = permissions;
  return apiResponse(req, res, modules[0], 200, "Success");
};

exports.deleteRole = async (req, res) => {
  var role_id = req.body.role_id;

  var role_permissions = await deleteRolePermissionModel(role_id);

  var role = await deleteRoleModel(role_id);

  if (role.affectedRows > 0) {
    return apiResponse(req, res, {}, 200, "Role and Permissions deleted successfully");
  }

  return apiResponse(req, res, {}, 500, "Something went wrong");
};
