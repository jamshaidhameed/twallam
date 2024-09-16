class AuthRepo {
  constructor() {}

  async registerModel(body, customer_id) {
    console.log("model", customer_id);
    console.log("body", body);
    return new Promise(async (resolve, reject) => {
      try {
        var [is_unique_user] = await promisePool.query(
          `SELECT u.id
                                                                FROM users u
                                                                where u.email = ?`,
          [body.email]
        );

        console.log("is_unique_user", is_unique_user);
        if (is_unique_user.length > 0) {
          resolve("1");
          return;
        } else {
          // var [user_register] = await promisePool.query(
          //   `INSERT INTO users
          //                (role_id, name, email, password, address, city, phone, company_name, postal_code, customer_id,
          //                 created_at,
          //                 updated_at)
          //                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, now(), now())`,
          //   [body.role_id, body.name, body.email, body.password, body.address, body.city, body.phone, body.company_name, body.postal_code, customer_id]
          // );

          // var [user_register] = await promisePool.query(
          //     `INSERT INTO users
          //      (role_id, email, password, company_name, customer_id, created_at, updated_at)
          //      VALUES (?, ?, ?, ?, ?, now(), now())`,
          //     [body.role_id, body.email, body.password, body.company_name, customer_id]
          // );

          const [user_register] = await promisePool.query(
            `INSERT INTO users
                             (name, role_id, email, password, company_name, customer_id, status, created_at, updated_at)
                         VALUES (?,?,?, ?, ?, ?,?, now(), now())`,
            [body.company_name, body.role_id, body.email, body.password, body.company_name, customer_id, 1]
          );

          console.log("user_register", user_register);

          const [user] = await promisePool.query(
            `SELECT u.*
                         FROM users as u
                         where u.id = ?`,
            [user_register.insertId]
          );
          resolve(user);
        }
      } catch (err) {
        reject(err);
      }
    });
  }

  async createZidUser(body) {
    return new Promise(async (resolve, reject) => {
      try {
        var [is_unique_user] = await promisePool.query(
            `SELECT *
                                                                FROM users u
                                                                where u.email = ?`,
            [body.email]
        );

        if (is_unique_user.length > 0) {
          resolve(is_unique_user);
        } else {
          const [user_register] = await promisePool.query(
              `INSERT INTO users
                             (name, role_id, email, password, company_name, customer_id, status, zid_store_id, zid_access_token, zid_refresh_token, authorization_token, created_at, updated_at)
                         VALUES (?,?,?, ?, ?, ?,?,?,?,?,?, now(), now())`,
              [body.company_name, body.role_id, body.email, body.password, body.company_name, null, 1, body.zid_store_id,body.zid_access_token, body.zid_refresh_token, body.authorization_token]
          );

          const [user] = await promisePool.query(
              `SELECT u.*
                         FROM users as u
                         where u.id = ?`,
              [user_register.insertId]
          );
          resolve(user);
        }
      } catch (err) {
        reject(err);
      }
    });
  }

  async loginModel(email) {
    return new Promise(async (resolve, reject) => {
      try {
        var query = `
                    SELECT u.*, r.name as role_name
                    FROM users u
                             Left JOIN roles r ON u.role_id = r.id
                    where u.email = ?`;
        var [user] = await promisePool.query(query, [email]);

        resolve(user);
      } catch (err) {
        reject(err);
      }
    });
  }

  async addSessionModel(token, user_id) {
    return new Promise(async (resolve, reject) => {
      try {
        var [user] = await promisePool.query(
          `SELECT s.*
                     FROM sessions s
                     where s.user_id = ?`,
          [user_id]
        );

        if (user.length > 0) {
          const [addSessions] = await promisePool.query(
            `UPDATE sessions
                         SET token     = ?,
                             updated_at=now()
                         WHERE user_id = ?`,
            [token, user_id]
          );
          resolve(addSessions);
        } else {
          const [addSessions] = await promisePool.query(
            `INSERT INTO sessions
                             (user_id, token, created_at, updated_at)
                         VALUES (?, ?, now(), now())`,
            [user_id, token]
          );
          resolve(addSessions);
        }
      } catch (err) {
        reject(err);
      }
    });
  }

  async forgetPasswordModel(email) {
    return new Promise(async (resolve, reject) => {
      try {
        var [user] = await promisePool.query(
          `SELECT u.*
                     FROM users u
                     where u.email = ?`,
          [email]
        );

        resolve(user);
      } catch (err) {
        reject(err);
      }
    });
  }

  async deleteOTPCodeModel(user_id) {
    return new Promise(async (resolve, reject) => {
      try {
        const [delete_user] = await promisePool.query(
          `DELETE
                                                               FROM reset_password
                                                               where user_id = ?`,
          [user_id]
        );
        resolve(delete_user);
      } catch (err) {
        reject(err);
      }
    });
  }

  async addOtpModel(token, user_id) {
    return new Promise(async (resolve, reject) => {
      try {
        var user_otp = await promisePool.query(
          `INSERT INTO reset_password
                         (user_id, token, created_at, updated_at)
                     VALUES (?, ?, now(), now())`,
          [user_id, token]
        );

        resolve(user_otp);
      } catch (err) {
        reject(err);
      }
    });
  }

  async matchOtpModel(otp) {
    return new Promise(async (resolve, reject) => {
      try {
        var [user] = await promisePool.query(
          `SELECT rp.user_id, rp.created_at
                                                      FROM reset_password rp
                                                      where rp.token = ?`,
          [otp]
        );

        if (user.length === 0) {
          // token does not matched
          resolve("1");
          return;
        } else {
          const createdAt = new Date(user[0].created_at);
          const currentTime = new Date();

          // Calculate the time difference in minutes
          const timeDifferenceInMinutes = Math.abs((currentTime - createdAt) / (60 * 1000));

          // Check if the time difference is greater than 15 minutes
          if (timeDifferenceInMinutes > 15) {
            // link is expired now
            resolve("2");
            return;
          }
        }
        resolve(user);
      } catch (err) {
        reject(err);
      }
    });
  }

  async matchOtpUserIdModel(user_id) {
    return new Promise(async (resolve, reject) => {
      try {
        var [user] = await promisePool.query(
          `SELECT rp.user_id, rp.created_at
                                                      FROM reset_password rp
                                                      where rp.user_id = ?`,
          [user_id]
        );

        if (user.length === 0) {
          // token does not matched
          resolve("1");
          return;
        }

        resolve(user);
      } catch (err) {
        reject(err);
      }
    });
  }

  async updatePasswordModel(password, user_id) {
    return new Promise(async (resolve, reject) => {
      try {
        const [update_password] = await promisePool.query(
          `UPDATE users
                                                                   SET password = ?
                                                                   WHERE id = ?`,
          [password, user_id]
        );

        resolve(update_password);
      } catch (err) {
        reject(err);
      }
    });
  }

  async getSuperAdminModel() {
    return new Promise(async (resolve, reject) => {
      try {
        var query = `
                    SELECT u.*
                    FROM users u
                    where u.role_id = ?`;
        var [user] = await promisePool.query(query, [1]);

        resolve(user);
      } catch (err) {
        reject(err);
      }
    });
  }

  async getParentRoleModel(id) {
    return new Promise(async (resolve, reject) => {
      try {
        var query = `
                    SELECT u.role_id
                    FROM users u
                    where u.id = ?`;
        var [user_parent_id] = await promisePool.query(query, [id]);

        resolve(user_parent_id[0]);
      } catch (err) {
        reject(err);
      }
    });
  }

  async getUserProfileModel(user_id) {
    return new Promise(async (resolve, reject) => {
      try {
        var query = `
                    SELECT u.*, r.name as role_name
                    FROM users u
                             LEFT JOIN roles r ON u.role_id = r.id
                    where u.id = ?`;
        var [user] = await promisePool.query(query, [user_id]);
        resolve(user);
      } catch (err) {
        reject(err);
      }
    });
  }

  async updateUserPasswordModel(password, user_id) {
    return new Promise(async (resolve, reject) => {
      try {
        const [update_password] = await promisePool.query(
          `UPDATE users
                     SET password = ?
                     WHERE id = ?`,
          [password, user_id]
        );
        resolve(update_password);
      } catch (err) {
        reject(err);
      }
    });
  }

  async updateUserProfileModel(data, user_id) {
    return new Promise(async (resolve, reject) => {
      try {
        let updateUserQuery = "UPDATE users SET";
        let params = [];
        var run_user_query = 0;
        // Check if parameters exist and build the query accordingly
        if (data.name) {
          run_user_query = 1;
          updateUserQuery += " name = ?,";
          params.push(data.name);
        }
        if (data.email) {
          run_user_query = 1;
          updateUserQuery += " email = ?,";
          params.push(data.email);
        }
        if (data.address) {
          run_user_query = 1;
          updateUserQuery += " address = ?,";
          params.push(data.address);
        }
        if (data.city) {
          run_user_query = 1;
          updateUserQuery += " city = ?,";
          params.push(data.city);
        }
        if (data.phone) {
          run_user_query = 1;
          updateUserQuery += " phone = ?,";
          params.push(data.phone);
        }
        if (data.postal_code) {
          run_user_query = 1;
          updateUserQuery += " postal_code = ?,";
          params.push(data.postal_code);
        }

        if (data.country) {
          run_user_query = 1;
          updateUserQuery += " country = ?,";
          params.push(data.country);
        }

        updateUserQuery = updateUserQuery.slice(0, -1) + " WHERE id = ?";
        params.push(user_id);

        // if (run_user_query) {
        const [update_profile] = await promisePool.query(updateUserQuery, params);
        //   console.log(updateUserQuery);
        // }
        resolve(update_profile);
      } catch (err) {
        reject(err);
      }
    });
  }

  async getSuperRoleIdModel(id) {
    return new Promise(async (resolve, reject) => {
      try {
        var query = `
                    SELECT u.role_id
                    FROM users u
                    where u.id = ?`;
        var [user_parent_id] = await promisePool.query(query, [id]);
        resolve(user_parent_id[0]);
      } catch (err) {
        reject(err);
      }
    });
  }

  async changeStatusModel(body) {
    return new Promise(async (resolve, reject) => {
      try {
        var query = `
                    UPDATE users
                    SET status = ?
                    WHERE id = ?`;
        var status = await promisePool.query(query, [body.status, body.user_id]);
        console.log(status);
        resolve(status);
      } catch (err) {
        reject(err);
      }
    });
  }

  async getModulePermissions(role_id) {
    return new Promise(async (resolve, reject) => {
      try {
        var query = `
                    SELECT mp.id,
                           mp.module_id,
                           mp.role_id,
                           mp.add_record,
                           mp.edit_record,
                           mp.list_record,
                           mp.delete_record
                    FROM module_permissions mp
                    where mp.role_id = ?
                    ORDER BY mp.module_id`;

        var [user_module_permissions] = await promisePool.query(query, [role_id]);

        resolve(user_module_permissions);
      } catch (err) {
        reject(err);
      }
    });
  }

  async isUserSubscribePackage(user_id) {
    return new Promise(async (resolve, reject) => {
      try {
        var [user] = await promisePool.query(
          `SELECT u.*
                     FROM user_subscriptions u
                     where u.user_id = ?`,
          [user_id]
        );

        resolve(user[0]);
      } catch (err) {
        reject(err);
      }
    });
  }

  async updateUserOtp(otp, user_id) {
    console.log("otp", otp);
    console.log("user_id", user_id);
    return new Promise(async (resolve, reject) => {
      try {
        const [update_otp] = await promisePool.query(
          `UPDATE users
                                                                   SET otp_code = ?
                                                                   WHERE id = ?`,
          [otp, user_id]
        );

        resolve(update_otp);
      } catch (err) {
        reject(err);
      }
    });
  }

  async matchSignUpOtpModel(otp, id) {
    return new Promise(async (resolve, reject) => {
      try {
        var [user] = await promisePool.query(
          `SELECT *
                                                      FROM users 
                                                      where id = ? AND otp_code = ? `,
          [id, otp]
        );
        resolve(user);
      } catch (err) {
        reject(err);
      }
    });
  }

  async checkAndGenerateUniqueCompanyName(params, id) {
    return new Promise(async (resolve, reject) => {
      try {
        const words = params.company_name.split(" ");
        const firstLetters = words.map((word) => word.charAt(0).toUpperCase());
        console.log("ffff ", firstLetters, firstLetters.join(""));
        const finalAbbr = firstLetters.join("");
        var [results] = await promisePool.query(
          `SELECT * FROM users WHERE id!=${id} AND 
            (company_name = ? OR name = ? OR erpnext_company_name = '${params.company_name}' OR erpnext_company_abbr='${finalAbbr}')`,
          [params.company_name, params.company_name]
        );

        const count = results.length;
        if (count === 0) {
          // Company name does not exist
          return resolve(params.company_name);
        }
        // Company name exists, generate a new one
        return resolve("1");
      } catch (err) {
        reject(err);
      }
    });
  }
  async updateErpCompanyDetails(params) {
    return new Promise(async (resolve, reject) => {
      try {
        const [update_company] = await promisePool.query(`UPDATE users SET erpnext_company_name = ?,erpnext_company_abbr=? WHERE id = ?`, [params.erpnext_company_name, params.erpnext_company_abbr, params.id]);

        resolve(update_company);
      } catch (err) {
        reject(err);
      }
    });
  }

  async updateGoogleToken(email, token) {
    console.log("email", email);
    console.log("token", token);
    return new Promise(async (resolve, reject) => {
      try {
        const [update_token] = await promisePool.query(`UPDATE users SET social_login_id = ? WHERE email = ?`, [token, email]);

        resolve(update_token);
      } catch (err) {
        reject(err);
      }
    });
  }

  async createGoogleLoginUser(name, email, password, token) {
    return new Promise(async (resolve, reject) => {
      try {
        const [user_register] = await promisePool.query(
          `INSERT INTO users
             (role_id, name, email, password, social_login_id, status,
              created_at,
              updated_at)
             VALUES (?, ?, ?, ?, ?, 1, now(), now())`,
          [2, name, email, password, token]
        );

        resolve(user_register);
      } catch (err) {
        reject(err);
      }
    });
  }

  async checkAndGenerateUniqueCustomerName(params, id) {
    return new Promise(async (resolve, reject) => {
      try {
        var [results] = await promisePool.query(
          `SELECT * FROM customers WHERE id!=${id} AND 
            (erpnext_customer_id = ?)`,
          [params.customer_name]
        );

        const count = results.length;
        if (count === 0) {
          // Customer name does not exist
          return resolve(params.customer_name);
        }
        // Customer name exists, generate a new one
        return resolve("1");
      } catch (err) {
        reject(err);
      }
    });
  }
}

module.exports = new AuthRepo();
