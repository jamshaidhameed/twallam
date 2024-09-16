class GeneralRepo {
  constructor() {}
  async addSettingModel(body) {
    // console.log("abdf");
    return new Promise(async (resolve, reject) => {
      try {
        const [setting] = await promisePool.query(
          `Insert Into general_setting(title, email, phone, address, address_ar, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, now(), now())`,
          [body.title, body.email, body.phone, body.address, body.address_ar]
        );
        resolve(setting);
      } catch (err) {
        reject(err);
      }
    });
  }
  async editSettingModel(body) {
    return new Promise(async (resolve, reject) => {
      try {
        const [setting] = await promisePool.query(
          `Update general_setting SET  title = ?, email = ?, phone = ?, address = ?, address_ar = ?
                   where id = ?`,
          [body.title, body.email, body.phone, body.address, body.address_ar, body.id]
        );

        resolve(setting);
      } catch (err) {
        reject(err);
      }
    });
  }
  async getSettingPageModel(body) {
    // console.log(body, uploadedFile);
    return new Promise(async (resolve, reject) => {
      //   console.log(page);
      try {
        const [setting] = await promisePool.query(
          `Select * from general_setting 
                   where id = ?`,
          [body.id]
        );
        // console.log(slider);

        // console.log(slider);
        resolve(setting);
      } catch (err) {
        reject(err);
      }
    });
  }
  async listSettingsModel() {
    return new Promise(async (resolve, reject) => {
      try {
        const [cms] = await promisePool.query(`SELECT * from general_setting`);
        resolve(cms);
      } catch (err) {
        reject(err);
      }
    });
  }
  async deleteSettingPageModel(body) {
    return new Promise(async (resolve, reject) => {
      try {
        const [deleteSetting] = await promisePool.query(
          `DELETE
                     FROM general_setting
                     where id = ?`,
          [body.id]
        );

        resolve(deleteSetting);
      } catch (err) {
        reject(err);
      }
    });
  }
}
module.exports = new GeneralRepo();
