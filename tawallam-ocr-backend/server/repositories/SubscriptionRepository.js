// const { promisePool } = require("../db");

class SubscriptionRepository {
  constructor() {}

  async addSubscriptionPackageModel(data) {
    console.log(data);
    return new Promise(async (resolve, reject) => {
      try {
        const [addSubscription] = await promisePool.query(
          `INSERT INTO subscription_packages
                             ( title, title_ar, description, description_ar, price, users, duration, status, product_id, price_id, created_at, updated_at)
                         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?,  now(), now())`,
          [data.title, data.title_ar, data.description, data.description_ar, data.price, data.users, data.duration, data.status, data.product_id, data.price_id]
        );

        resolve(addSubscription);
      } catch (err) {
        reject(err);
      }
    });
  }

  async updateSubscriptionPackageModel(body) {
    return new Promise(async (resolve, reject) => {
      try {
        const [updateSubscriptionPackage] = await promisePool.query(
          `UPDATE subscription_packages
                         SET title = ?, title_ar = ?, description = ?, description_ar = ?, price = ?, users = ?, duration = ?, status = ?,  price_id = ?, updated_at=now()
                         WHERE id = ?`,
          [body.title, body.title_ar, body.description, body.description_ar, body.price, body.users, body.duration, body.status, body.price_id, body.id]
        );
        resolve(updateSubscriptionPackage);
      } catch (err) {
        reject(err);
      }
    });
  }

  async deleteSubscriptionPackageModel(body) {
    return new Promise(async (resolve, reject) => {
      try {
        const [deletesubscription] = await promisePool.query(
          `DELETE
                         FROM subscription_packages
                         where id = ?`,
          [body.id]
        );

        resolve(deletesubscription);
      } catch (err) {
        reject(err);
      }
    });
  }

  async subscriptionPackageListModel() {
    return new Promise(async (resolve, reject) => {
      try {
        const [list] = await promisePool.query(`SELECT * from subscription_packages where deleted = 0`);
        resolve(list);
      } catch (err) {
        reject(err);
      }
    });
  }

  // async subscriptionPackageListModel(params) {
  //   return new Promise(async (resolve, reject) => {
  //     try {
  //       const [list] = await promisePool.query(`SELECT * from subscription_packages`);
  //       resolve(list);
  //     } catch (err) {
  //       reject(err);
  //     }
  //   });
  // }

  async getSubscriptionPackageModel(payload) {
    return new Promise(async (resolve, reject) => {
      try {
        const [subscriptionPackage] = await promisePool.query(`Select * from subscription_packages where id = ?`, [payload.id]);
        console.log(subscriptionPackage);
        resolve(subscriptionPackage);
      } catch (err) {
        reject(err);
      }
    });
  }

  async saveUserSubscriptionModel(data) {
    try {
      const [saveUserSubscription] = await promisePool.execute(
        `INSERT INTO user_subscriptions
             (user_id, subscription_id, package_id, package_name, created_at, updated_at)
             VALUES (?, ?, ?, ?, now(), now())`,
        [data.user_id, data.subscription_id, data.package_id, data.package_name]
      );

      await promisePool.execute(`UPDATE users SET status = 1 WHERE id = ?`, [data.user_id]);

      return saveUserSubscription;
    } catch (err) {
      throw err;
    }
  }

  async updateSubscriptionPackageTypeModel(body) {
    return new Promise(async (resolve, reject) => {
      try {
        const [subscriptionPackageChange] = await promisePool.query(
          `UPDATE subscription_packages
                         SET type = ?, updated_at=now()
                         WHERE type = ?`,
          [0, 1]
        );

        const [updateSubscriptionPackage] = await promisePool.query(
          `UPDATE subscription_packages
                         SET type = ?, updated_at=now()
                         WHERE id = ?`,
          [1, body.id]
        );
        resolve(updateSubscriptionPackage);
      } catch (err) {
        reject(err);
      }
    });
  }
}

module.exports = new SubscriptionRepository();
