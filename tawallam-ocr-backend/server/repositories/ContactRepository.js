class ContactRepo {
  constructor() {}

  async ContactModel(body) {
    return new Promise(async (resolve, reject) => {
      try {
        const [Contact] = await promisePool.query(
          `Insert Into Contact (title, lang_id, phone, email, address, description, created_at, updated_at)
                VALUES(?,?,?,?,?,?, now(), now())`,
          [body.title, body.lang_id, body.phone, body.email, body.address, body.description]
        );
        resolve(Contact);
      } catch (err) {
        reject(err);
      }
    });
  }
  async editContactModel(body) {
    return new Promise(async (resolve, reject) => {
      try {
        console.log(body);
        const [contact] = await promisePool.query(
          `UPDATE Contact 
                     SET title = ?, lang_id = ?, phone = ?, email = ?, address = ?, description = ?,
                         updated_at=now()
                     WHERE id = ?`,
          [body.title, body.lang_id, body.phone, body.email, body.address, body.description, body.id]
        );
        // console.log(body.name);
        resolve(contact);
      } catch (err) {
        reject(err);
      }
    });
  }

  async listContactModel() {
    return new Promise(async (resolve, reject) => {
      try {
        const [contact] = await promisePool.query(`SELECT * from Contact`);
        resolve(contact);
      } catch (err) {
        reject(err);
      }
    });
  }
  async getContactModel(payload) {
    return new Promise(async (resolve, reject) => {
      try {
        const [contact] = await promisePool.query(`SELECT * from Contact where id = ?`, [payload.id]);
        resolve(contact);
      } catch (err) {
        reject(err);
      }
    });
  }

  async deleteContactModel(body) {
    return new Promise(async (resolve, reject) => {
      try {
        const [deleteContact] = await promisePool.query(
          `DELETE
                     FROM Contact
                     where id = ?`,
          [body.id]
        );

        resolve(deleteContact);
      } catch (err) {
        reject(err);
      }
    });
  }

  async addSubscriberModel(body) {
    return new Promise(async (resolve, reject) => {
      try {
        const [subscriber] = await promisePool.query(
          `Insert Into subscribers (email, created_at, updated_at)
                VALUES(?, now(), now())`,
          [body.email]
        );
        resolve(subscriber);
      } catch (err) {
        reject(err);
      }
    });
  }
  async getSubscriberModel(body) {
    return new Promise(async (resolve, reject) => {
      try {
        var query = `
                    SELECT s.*
                    FROM subscribers s
                    where s.email = ?`;
        var [user] = await promisePool.query(query, [body.email]);

        resolve(user);
      } catch (err) {
        reject(err);
      }
    });
  }
}

module.exports = new ContactRepo();
