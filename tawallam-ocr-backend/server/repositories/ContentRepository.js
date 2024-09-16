class ContentRepo {
  constructor() {}

  async addcontentModel(body, uploadedFile) {
    return new Promise(async (resolve, reject) => {
      try {
        const [content] = await promisePool.query(
          `INSERT INTO home_contents(title, title_ar, short_description_ar, short_description, long_description, long_description_ar, image, created_at, updated_at)
                    VALUES(?,?,?,?,?,?,?, now(), now())`,
          [body.title, body.title_ar, body.short_description_ar, body.short_description, body.long_description, body.long_description_ar, uploadedFile]
        );
        resolve(content);
      } catch (err) {
        reject(err);
      }
    });
  }


  async ContentModel(body, uploadedFile) {

    return new Promise(async (resolve, reject) => {
      try {

          const [home_contents] = await promisePool.query(`SELECT * FROM home_contents where step_id = ?`,[body.step_id]);

          if (home_contents.length > 0){

            if (uploadedFile !== null){
              const [home_contents] = await promisePool.query(`UPDATE home_contents SET title = ?, title_ar = ?, long_description = ?, long_description_ar = ?, image = ? where step_id = ?`,[body.title, body.title_ar, body.long_description, body.long_description_ar, uploadedFile, body.step_id])
              resolve(home_contents);

            }
            else {
              const [home_contents] = await promisePool.query(`UPDATE home_contents SET title = ?, title_ar = ?, long_description = ?, long_description_ar = ? where step_id = ?`,[body.title, body.title_ar, body.long_description, body.long_description_ar, body.step_id])
              resolve(home_contents);
            }
          }
          else {

            const [home_contents] = await promisePool.query(
                `Insert Into home_contents(title, title_ar, long_description, long_description_ar, image, step_id, created_at, updated_at)
               VALUES (?, ?, ?, ?, ?,?, now(), now())`,
                [body.title, body.title_ar, body.long_description, body.long_description_ar, uploadedFile, body.step_id]
            );
            resolve(home_contents);
          }

      } catch (err) {
        reject(err);
      }
    });
  }

  async editContentModel(body, uploadedFile) {
    return new Promise(async (resolve, reject) => {
      try {
        const [content] = await promisePool.query(`Update home_contents SET title = ?, title_ar = ?, short_description_ar = ?, short_description = ?, long_description = ?, long_description_ar = ?` + (uploadedFile != "" ? ` ,image = '${uploadedFile}' ` : "") + ` where id = ?`, [body.title, body.title_ar, body.short_description_ar, body.short_description, body.long_description, body.long_description_ar, body.id]);

        resolve(content);
      } catch (err) {
        reject(err);
      }
    });
  }
  async getContentRepo(payload) {
    return new Promise(async (resolve, reject) => {
      try {
        const [content] = await promisePool.query(`Select * from home_contents where step_id = ?`, [payload.id]);
        resolve(content);
      } catch (err) {
        reject(err);
      }
    });
  }
  async listContentsModel() {
    return new Promise(async (resolve, reject) => {
      try {
        const [content] = await promisePool.query(`SELECT * from home_contents`);
        resolve(content);
      } catch (err) {
        reject(err);
      }
    });
  }
  async deleteContentModel(body) {
    return new Promise(async (resolve, reject) => {
      try {
        const [deleteContent] = await promisePool.query(
          `DELETE
                     FROM home_contents
                     where id = ?`,
          [body.id]
        );

        resolve(deleteContent);
      } catch (err) {
        reject(err);
      }
    });
  }
}
module.exports = new ContentRepo();
