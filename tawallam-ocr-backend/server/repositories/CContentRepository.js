class ContactContentRepo {
  constructor() {}

  async addContectContentModel(body) {
    return new Promise(async (resolve, reject) => {
      try {
        const [CContact] = await promisePool.query(
          `INSERT INTO contact_content(title, description, created_at, updated_at)
                    VALUES(?,?,now(),now())`,
          [body.title, body.description]
        );
        resolve(CContact);
      } catch (err) {
        reject(err);
      }
    });
  }
  async editContactContentModel(body) {
    // console.log(body, uploadedFile);
    return new Promise(async (resolve, reject) => {
      //   console.log(page);
      try {
        const [content] = await promisePool.query(`Update contact_content SET title = ?, description = ? where id = ?`, [body.title, body.description, body.id]);
        // console.log(slider);

        // console.log(slider);
        resolve(content);
      } catch (err) {
        reject(err);
      }
    });
  }
  async listContactContentModel() {
    return new Promise(async (resolve, reject) => {
      try {
        const [content] = await promisePool.query(`SELECT * from contact_content`);
        resolve(content);
      } catch (err) {
        reject(err);
      }
    });
  }
  async getContactContentModel(payload) {
    return new Promise(async (resolve, reject) => {
      try {
        const [content] = await promisePool.query(`Select * from contact_content where id = ?`, [payload.id]);
        resolve(content);
      } catch (err) {
        reject(err);
      }
    });
  }

  async deleteContactContentModel(body) {
    return new Promise(async (resolve, reject) => {
      try {
        const [deleteContent] = await promisePool.query(
          `DELETE
                     FROM contact_content
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
module.exports = new ContactContentRepo();
