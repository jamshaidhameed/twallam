class SubAdminRepo {
  constructor() {}

  async subAdminRegisterModel(body) {
    return new Promise(async (resolve, reject) => {
      try {
        var [is_unique_user] = await promisePool.query(
          `SELECT u.id
                                                                FROM users u
                                                                where u.email = ?`,
          [body.email]
        );
        if (is_unique_user.length > 0) {
          resolve("1");
          return;
        } else {
          var [user_register] = await promisePool.query(
            `INSERT INTO users
                         (super_parent_id, role_id, parent_id, name, email, password, address, city, phone,
                          company_name, postal_code, status,
                          created_at, updated_at)
                         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, now(), now())`,
            [body.super_parent_id, body.role_id, body.parent_id, body.name, body.email, body.password, body.address, body.city, body.phone, body.company_name, body.postal_code, body.status]
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

  // async loginModel(email) {
  //     return new Promise(async (resolve, reject) => {
  //         try {
  //             var query = `
  //                 SELECT u.*
  //                 FROM users u
  //                 where u.email = ?`;
  //             var [user] = await promisePool.query(query, [email]);
  //
  //             resolve(user);
  //         } catch (err) {
  //             reject(err);
  //         }
  //     });
  // }
  //
  // async addSessionModel(token, user_id) {
  //     return new Promise(async (resolve, reject) => {
  //         try {
  //             var [user] = await promisePool.query(
  //                 `SELECT s.*
  //                  FROM sessions s
  //                  where s.user_id = ?`,
  //                 [user_id]
  //             );
  //
  //             if (user.length > 0) {
  //                 const [addSessions] = await promisePool.query(
  //                     `UPDATE sessions
  //                      SET token     = ?,
  //                          updated_at=now()
  //                      WHERE user_id = ?`,
  //                     [token, user_id]
  //                 );
  //                 resolve(addSessions);
  //             } else {
  //                 const [addSessions] = await promisePool.query(
  //                     `INSERT INTO sessions
  //                          (user_id, token, created_at, updated_at)
  //                      VALUES (?, ?, now(), now())`,
  //                     [user_id, token]
  //                 );
  //                 resolve(addSessions);
  //             }
  //         } catch (err) {
  //             reject(err);
  //         }
  //     });
  // }
  //
  // async forgetPasswordModel(email) {
  //     return new Promise(async (resolve, reject) => {
  //         try {
  //             var [user] = await promisePool.query(
  //                 `SELECT u.*
  //                  FROM users u
  //                  where u.email = ?`,
  //                 [email]
  //             );
  //
  //             resolve(user);
  //         } catch (err) {
  //             reject(err);
  //         }
  //     });
  // }
  //
  // async deleteOTPCodeModel(user_id) {
  //     return new Promise(async (resolve, reject) => {
  //         try {
  //             const [delete_user] = await promisePool.query(`DELETE FROM reset_password where user_id = ?`, [user_id]);
  //             resolve(delete_user);
  //         } catch (err) {
  //             reject(err);
  //         }
  //     });
  // }
  // async addOtpModel(token, user_id) {
  //     return new Promise(async (resolve, reject) => {
  //         try {
  //             var user_otp = await promisePool.query(
  //                 `INSERT INTO reset_password
  //                          (user_id, token,created_at,updated_at)
  //                          VALUES (?, ?, now(),now())`,
  //                 [user_id, token]
  //             );
  //
  //             resolve(user_otp);
  //         } catch (err) {
  //             reject(err);
  //         }
  //     });
  // }
  //
  //
  // async matchOtpModel(otp) {
  //     return new Promise(async (resolve, reject) => {
  //         try {
  //             var [user] = await promisePool.query(`SELECT rp.user_id,rp.created_at FROM reset_password rp where rp.token = ?`, [otp]);
  //
  //             if (user.length === 0) {
  //                 // token does not matched
  //                 resolve("1");
  //                 return;
  //             } else {
  //                 const createdAt = new Date(user[0].created_at);
  //                 const currentTime = new Date();
  //
  //                 // Calculate the time difference in minutes
  //                 const timeDifferenceInMinutes = Math.abs((currentTime - createdAt) / (60 * 1000));
  //
  //                 // Check if the time difference is greater than 15 minutes
  //                 if (timeDifferenceInMinutes > 15) {
  //                     // link is expired now
  //                     resolve("2");
  //                     return;
  //                 }
  //             }
  //             resolve(user);
  //         } catch (err) {
  //             reject(err);
  //         }
  //     });
  // }
  // async matchOtpUserIdModel(user_id) {
  //     return new Promise(async (resolve, reject) => {
  //         try {
  //             var [user] = await promisePool.query(`SELECT rp.user_id,rp.created_at FROM reset_password rp where rp.user_id = ?`, [user_id]);
  //
  //             if (user.length === 0) {
  //                 // token does not matched
  //                 resolve("1");
  //                 return;
  //             }
  //
  //             resolve(user);
  //         } catch (err) {
  //             reject(err);
  //         }
  //     });
  // }
  // async updatePasswordModel(password, user_id) {
  //     return new Promise(async (resolve, reject) => {
  //         try {
  //             const [update_password] = await promisePool.query(`UPDATE users SET password = ? WHERE id = ?`, [password, user_id]);
  //
  //             resolve(update_password);
  //         } catch (err) {
  //             reject(err);
  //         }
  //     });
  // }

  async editSubAdminModel(user_id) {
    return new Promise(async (resolve, reject) => {
      try {
        var query = `
                    SELECT u.*
                    FROM users u
                    where u.id = ?`;
        var [user] = await promisePool.query(query, [user_id]);

        resolve(user);
      } catch (err) {
        reject(err);
      }
    });
  }

  async listUserModel(params) {
    return new Promise(async (resolve, reject) => {
      try {
        var limit = params.limit;
        var skip = params.skip;
        var query = `
                    SELECT u.id,
                           u.role_id,
                           r.name as role_name,
                           u.parent_id,
                           u.name,
                           u.email,
                           u.address,
                           u.city,
                           u.state,
                           u.company_name,
                           u.postal_code,
                           u.status,
                           u.created_at,
                           (CASE WHEN us.user_id IS NOT NULL THEN 'YES' ELSE 'NO' END) AS subscription_exists
                    FROM users u
                    LEFT JOIN user_subscriptions us
                    ON u.id = us.user_id
                    LEFT JOIN roles r
                    ON u.role_id = r.id
                    WHERE u.${params.filter_key} = ? and u.id != ${params.user_id}
                    ORDER BY u.id DESC
                    LIMIT ? OFFSET ?`;

        var [user] = await promisePool.query(query, [params.filter_value, limit, skip]);

        const [total_records] = await promisePool.query(`SELECT count(u.id) as records FROM users u WHERE u.${params.filter_key} = ?`, [params.filter_value]);

        var response = {
          records: user,
          total_records: total_records[0].records,
          limit: limit,
          pages: Math.ceil(total_records[0].records / limit),
        };
        resolve(response);
      } catch (err) {
        reject(err);
      }
    });
  }

  async deleteSubAdminModel(user_id) {
    return new Promise(async (resolve, reject) => {
      try {
        var query = `DELETE
                             FROM users
                             where id = ?`;
        var [user] = await promisePool.query(query, [user_id]);

        resolve(user);
      } catch (err) {
        reject(err);
      }
    });
  }

  async updateSubAdminModel(body) {
    return new Promise(async (resolve, reject) => {
      var password = "";
      if (body.password) {
        password = ` ,password = '${body.password}'`;
      }
      try {
        var query = `UPDATE users
                             SET name = ?,
                                 email=?,
                                 address=?,
                                 city=?,
                                 role_id=?,
                                 status=?,
                                 phone=?,
                                 postal_code=? ${password}
                             where id = ?`;
        var [user] = await promisePool.query(query, [body.name, body.email, body.address, body.city, body.role_id, body.status, body.phone, body.postal_code, body.user_id]);

        resolve(user);
      } catch (err) {
        reject(err);
      }
    });
  }
}

module.exports = new SubAdminRepo();
