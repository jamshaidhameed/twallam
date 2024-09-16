// import { reject } from "lodash";
// import { promisePool } from "../db";

class PageRepo {
  constructor() {}

  async PagesModel(name, title, long_description, name_ar, title_ar, long_description_ar, section_id, file ) {
    return new Promise(async (resolve, reject) => {
      try {
        // const [Page] = await promisePool.query(
        //   `Insert Into cms_pages(name, name_ar, title, title_ar, lang_id, long_description, long_description_ar, section_id, image, created_at, updated_at)
        //         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, now(), now())`,
        //   [name, name_ar, title, title_ar, null, long_description, long_description_ar, section_id], file
        // );


        const [cms_pages] = await promisePool.query(`SELECT * FROM cms_pages where section_id = ?`,[section_id]);

        if (cms_pages.length > 0){

          if (file != null){
            let [cms_pages] = await promisePool.query(`UPDATE cms_pages SET name = ?, name_ar = ?, title = ?, title_ar = ?, long_description = ?, long_description_ar = ?, image = ? where section_id = ?`,[name, name_ar, title, title_ar,long_description, long_description_ar, file, section_id])
            resolve(cms_pages);
          }
          else {
            let [cms_pages] = await promisePool.query(`UPDATE cms_pages SET name = ?, name_ar = ?, title = ?, title_ar = ?, long_description = ?, long_description_ar = ? where section_id = ?`,[name, name_ar, title, title_ar,long_description, long_description_ar, section_id])
            resolve(cms_pages);
          }
        }
        else {
          const [cms_pages] = await promisePool.query(
              `Insert Into cms_pages(name, name_ar, title, title_ar, lang_id, long_description, long_description_ar, section_id, image, created_at, updated_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, now(), now())`,
              [name, name_ar, title, title_ar, null, long_description, long_description_ar, section_id, file]
          );
          resolve(cms_pages);
        }


      } catch (err) {
        reject(err);
      }
    });
  }
  async editpageModel(body) {
    return new Promise(async (resolve, reject) => {
      try {
        console.log(body);
        const [edit] = await promisePool.query(
          `UPDATE cms_pages
                     SET name = ?, title = ?, lang_id = ?, short_description = ?, long_description = ?, section_id = ?,
                         updated_at=now()
                     WHERE id = ?`,
          [body.name, body.title, body.lang_id, body.short_description, body.long_description, body.section_id, body.id]
        );
        // console.log(body.name);
        resolve(edit);
      } catch (err) {
        reject(err);
      }
    });
  }

  async delete_pagesModel(body) {
    return new Promise(async (resolve, reject) => {
      try {
        const [delete_page] = await promisePool.query(
          `DELETE
                     FROM cms_pages
                     where id = ?`,
          [body.id]
        );

        resolve(delete_page);
      } catch (err) {
        reject(err);
      }
    });
  }
  async listPagesModel() {
    return new Promise(async (resolve, reject) => {
      try {
        const [list] = await promisePool.query(`SELECT * from cms_pages`);
        resolve(list);
      } catch (err) {
        reject(err);
      }
    });
  }

  async getPageRepo(payload) {
    return new Promise(async (resolve, reject) => {
      try {
        const [list] = await promisePool.query(`Select * from cms_pages where section_id = ?`, [payload.section_id]);
        resolve(list);
      } catch (err) {
        reject(err);
      }
    });
  }

  async getSections() {
    return new Promise(async (resolve, reject) => {
      try {
        const [list] = await promisePool.query(`Select * from cms_pages`);
        resolve(list);
      } catch (err) {
        reject(err);
      }
    });
  }
}
module.exports = new PageRepo();
