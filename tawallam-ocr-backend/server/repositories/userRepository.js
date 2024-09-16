class UserReposiotry {
    constructor() {
    }

    async attachPaymentMethod(data) {
        return new Promise(async (resolve, reject) => {
          try {
            const [addSubscription] = await promisePool.query(
              `INSERT INTO subscription_packages
                             (title, description, price, users, duration, status, product_id, plan_id, created_at, updated_at)
                         VALUES (?, ?, ?, ?, ?, ?, ?, ?,  now(), now())`,
              [data.title, data.description, data.price, data.users, data.duration, data.status, data.product_id, data.plan_id]
            );

            resolve(addSubscription);
          } catch (err) {
            reject(err);
          }
        });
      }

      
    async getCustomerId(id) {
      return new Promise(async (resolve, reject) => {
        try {
          const [user] = await promisePool.query(`Select * from users where id = ?`, [id]);
          resolve(user);
        } catch (err) {
          reject(err);
        }
      });
    }

    async getSubscriptionModel(id) {
      return new Promise(async (resolve, reject) => {
        try {
          const [subscriptonPackage] = await promisePool.query(`Select * from subscription_packages where product_id = ?`, [id]);
          resolve(subscriptonPackage);
        } catch (err) {
          reject(err);
        }
      });
    }
    
    


}


module.exports = new UserReposiotry();