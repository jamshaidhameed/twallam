class CmsRepo {
  constructor() {}

  async addCmsPageModel(body) {
    // console.log("abdf");
    return new Promise(async (resolve, reject) => {
      try {
        const [cms] = await promisePool.query(
          `Insert Into cms_pages(name, name_ar, title, title_ar, lang_id, long_description, long_description_ar, section_id,created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, now(), now())`,
          [body.name, body.name_ar, body.title, body.title_ar, body.lang_id, body.long_description, body.long_description_ar, body.section_id]
        );
        resolve(cms);
      } catch (err) {
        reject(err);
      }
    });
  }

  async editCmsPageModel(body) {
    return new Promise(async (resolve, reject) => {
      try {
        const [cms] = await promisePool.query(
          `Update cms_pages SET  name = ?, name_ar = ?, title = ?, title_ar = ?,long_description=?, long_description_ar = ?, section_id = ?
                   where id = ?`,
          [body.name, body.name_ar, body.title, body.title_ar, body.long_description, body.long_description_ar, body.section_id, body.id]
        );

        resolve(cms);
      } catch (err) {
        reject(err);
      }
    });
  }
  async getCmsPageModel(body) {
    // console.log(body, uploadedFile);
    return new Promise(async (resolve, reject) => {
      //   console.log(page);
      try {
        const [cms] = await promisePool.query(
          `Select * from cms_pages 
                   where id = ?`,
          [body.id]
        );
        // console.log(slider);

        // console.log(slider);
        resolve(cms);
      } catch (err) {
        reject(err);
      }
    });
  }
  async listCmsPagesModel() {
    return new Promise(async (resolve, reject) => {
      try {
        const [cms] = await promisePool.query(`SELECT * from cms_pages`);
        resolve(cms);
      } catch (err) {
        reject(err);
      }
    });
  }
  async deleteCmsPageModel(body) {
    return new Promise(async (resolve, reject) => {
      try {
        const [deletecms] = await promisePool.query(
          `DELETE
                     FROM cms_pages
                     where id = ?`,
          [body.id]
        );

        resolve(deletecms);
      } catch (err) {
        reject(err);
      }
    });
  }
}
module.exports = new CmsRepo();
