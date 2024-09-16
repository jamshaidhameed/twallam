class ModulePermissionRepository {
  constructor() {}
  async addRole(role_name, super_parent_id) {
    return new Promise(async (resolve, reject) => {
      try {
        var [add_role] = await promisePool.query(
          `INSERT INTO roles
                     (name, company_id, created_at,
                      updated_at)
                     VALUES (?,?, now(), now())`,
          [role_name, super_parent_id]
        );

        const [role] = await promisePool.query(
          `SELECT *
                         FROM roles
                         where id = ?`,
          [add_role.insertId]
        );
        resolve(role);
      } catch (err) {
        reject(err);
      }
    });
  }

  async addPermission(role_id, key, permission) {
    return new Promise(async (resolve, reject) => {
      try {
        var [module_permission] = await promisePool.query(
          `INSERT INTO module_permissions
                     (module_id, role_id, add_record, edit_record, list_record, delete_record, created_at,
                      updated_at)
                     VALUES (?,?,?,?,?,?, now(), now())`,
          [key, role_id, permission.add, permission.edit, permission.list, permission.delete]
        );

        resolve(module_permission);
      } catch (err) {
        reject(err);
      }
    });
  }

  async listPermissionModel(body) {
    return new Promise(async (resolve, reject) => {
      try {
        let permissionList;
        if (body.access == "company") {
          const [result] = await promisePool.query(`
                        SELECT * FROM modules WHERE access_to = 'company' OR access_to = 'both'
                    `);
          permissionList = result;
        } else if (body.access == "super") {
          const [result] = await promisePool.query(`
                        SELECT * FROM modules WHERE access_to = 'super' OR access_to = 'both'
                    `);
          permissionList = result;
        } else {
          const [result] = await promisePool.query(`SELECT * FROM modules`);
          permissionList = result;
        }
        resolve(permissionList);
      } catch (err) {
        reject(err);
      }
    });
  }

  async listRolesModel(body, user_role_id) {
    return new Promise(async (resolve, reject) => {
      try {
        let rolesList;
        if (body.company_id == "") {
          const [result] = await promisePool.query(`SELECT * FROM roles WHERE company_id is NULL AND id >3  AND id!=${user_role_id}`);
          rolesList = result;
        } else {
          const [result] = await promisePool.query(
            `
                        SELECT * FROM roles WHERE company_id = ? AND id!=${user_role_id}`,
            [body.company_id]
          );
          rolesList = result;
        }
        resolve(rolesList);
      } catch (err) {
        reject(err);
      }
    });
  }

  async updateRole(role_name, role_id) {
    return new Promise(async (resolve, reject) => {
      try {
        const [update_role] = await promisePool.query(
          `UPDATE roles
                     SET name     = ?,
                         updated_at=now()
                     WHERE id = ?`,
          [role_name, role_id]
        );

        const [role] = await promisePool.query(
          `SELECT *
                         FROM roles
                         where id = ?`,
          [role_id]
        );
        resolve(role);
      } catch (err) {
        reject(err);
      }
    });
  }

  async updatePermission(role_id, key, permission) {
    return new Promise(async (resolve, reject) => {
      try {
        const [update_module_permission] = await promisePool.query(
          `UPDATE module_permissions
                     SET add_record    = ?,
                         edit_record   = ?,
                         list_record   = ?,
                         delete_record = ?,
                         updated_at=now()
                     WHERE role_id = ?
                       and module_id = ?`,
          [permission.add, permission.edit, permission.list, permission.delete, role_id, key]
        );
        resolve(update_module_permission);
      } catch (err) {
        reject(err);
      }
    });
  }

  async editPermissionModel(role_id) {
    return new Promise(async (resolve, reject) => {
      try {
        const [result] = await promisePool.query(`SELECT * FROM roles where id = ${role_id}`);
        resolve(result);
      } catch (err) {
        reject(err);
      }
    });
  }

  async getModulePermissionListModel(role_id) {
    return new Promise(async (resolve, reject) => {
      try {
        const [result] = await promisePool.query(`SELECT * FROM module_permissions where role_id = ${role_id}`);
        resolve(result);
      } catch (err) {
        reject(err);
      }
    });
  }

  async deleteRoleModel(role_id) {
    return new Promise(async (resolve, reject) => {
      try {
        var query = `DELETE
                             FROM roles
                             where id = ?`;
        var [role] = await promisePool.query(query, [role_id]);

        resolve(role);
      } catch (err) {
        reject(err);
      }
    });
  }

  async deleteRolePermissionModel(role_id) {
    return new Promise(async (resolve, reject) => {
      try {
        var query = `DELETE
                             FROM module_permissions
                             where role_id = ?`;
        var [role] = await promisePool.query(query, [role_id]);

        resolve(role);
      } catch (err) {
        reject(err);
      }
    });
  }
}

module.exports = new ModulePermissionRepository();
