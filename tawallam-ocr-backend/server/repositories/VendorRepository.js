class VendorRepo {
  constructor() {}

  async addVendorModel(body) {
    return new Promise(async (resolve, reject) => {
      try {
        const [vendor] = await promisePool.query(
          `
            INSERT INTO vendor(name, phone, address, city, created_at, updated_at)
            VALUES(?, ?, ?, ?, now(), now())`,
          [body.name, body.phone, body.address, body.city]
        );
        resolve(vendor);
      } catch (err) {
        reject(err);
      }
    });
  }
  async editVendorModel(body) {
    // console.log(body, uploadedFile);
    return new Promise(async (resolve, reject) => {
      //   console.log(page);
      try {
        const [vendor] = await promisePool.query(
          `Update vendor SET name = ?, phone = ?, address = ?, city = ?
                   where id = ?`,
          [body.name, body.phone, body.address, body.city, body.id]
        );
        // console.log(slider);

        // console.log(slider);
        resolve(vendor);
      } catch (err) {
        reject(err);
      }
    });
  }

  async getVendorModel(body) {
    // console.log(body, uploadedFile);
    return new Promise(async (resolve, reject) => {
      //   console.log(page);
      try {
        const [vendor] = await promisePool.query(
          `Select * from vendor 
                   where id = ?`,
          [body.id]
        );
        // console.log(slider);

        // console.log(slider);
        resolve(vendor);
      } catch (err) {
        reject(err);
      }
    });
  }
  async listVendorsModel() {
    return new Promise(async (resolve, reject) => {
      try {
        const [vendor] = await promisePool.query(`SELECT * from vendor`);
        resolve(vendor);
      } catch (err) {
        reject(err);
      }
    });
  }
  async deleteVendorModel(body) {
    return new Promise(async (resolve, reject) => {
      try {
        const [deleteVendor] = await promisePool.query(
          `DELETE
                     FROM vendor
                     where id = ?`,
          [body.id]
        );

        resolve(deleteVendor);
      } catch (err) {
        reject(err);
      }
    });
  }
}
module.exports = new VendorRepo();
