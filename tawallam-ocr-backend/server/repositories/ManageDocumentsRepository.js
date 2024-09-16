class ManageDocumentsRepository {
  constructor() {}
  async addDocument(title, company_id, filePath, filename, description) {
    console.log(filename);
    return new Promise(async (resolve, reject) => {
      try {
        const [addInvoices] = await promisePool.query(
          `INSERT INTO manage_documents
                                   (title,company_id,file_path, file_name, description, created_at, updated_at)
                               VALUES (?,?,?,?,?, now(), now())`,
          [title, company_id, filePath, filename, description]
        );

        resolve(addInvoices);
      } catch (err) {
        reject(err);
      }
    });
  }

  async listDocument({ page, limit, company_id, skip }) {
    try {
      const base_url = process.env.APP_BASE_URL + "/";
      const [documents] = await promisePool.query(
        `SELECT id, title, company_id , CONCAT(?, file_path) AS file_path, file_path, file_name, status, created_at, updated_at 
             FROM manage_documents 
             WHERE company_id = ? 
             ORDER BY created_at DESC 
             LIMIT ?, ?`,
        [base_url,company_id, skip, limit]
      );

      const [totalRecords] = await promisePool.query(
        `SELECT COUNT(*) AS total_records 
             FROM manage_documents 
             WHERE company_id = ?`,
        [company_id]
      );

      const totalRecordsCount = totalRecords[0].total_records;

      return { documents, totalRecordsCount };
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  async editDocument(id) {
    const base_url = process.env.APP_BASE_URL + "/";
    return new Promise(async (resolve, reject) => {
      try {
        const [document] = await promisePool.query(
          `SELECT id, title, company_id, CONCAT(?, file_path) AS file_path, file_name, description, created_at, updated_at 
                 FROM manage_documents 
                 WHERE id = ?`,
          [base_url, id]
        );

        if (document.length === 0) {
          resolve(null);
        } else {
          resolve(document[0]);
        }
      } catch (err) {
        reject(err);
      }
    });
  }

  async getDocumentById(id) {
    return new Promise(async (resolve, reject) => {
      try {
        const [document] = await promisePool.query(
          `SELECT * FROM manage_documents WHERE id = ?`,
          [id]
        );
        resolve(document[0]);
      } catch (err) {
        reject(err);
      }
    });
  }

  async updateDocument(id, title, company_id, filePath, filename, description) {
    return new Promise(async (resolve, reject) => {
      try {
        const [result] = await promisePool.query(
          `UPDATE manage_documents 
                 SET title = ?, company_id = ?, file_path = ?, file_name = ?, description = ?, updated_at = now() 
                 WHERE id = ?`,
          [title, company_id, filePath, filename, description, id]
        );
        resolve(result);
      } catch (err) {
        reject(err);
      }
    });
  }

  async deleteDocument(id) {
    return new Promise(async (resolve, reject) => {
      try {
        const [result] = await promisePool.query(
          `DELETE FROM manage_documents WHERE id = ?`,
          [id]
        );
        resolve(result.affectedRows);
      } catch (err) {
        reject(err);
      }
    });


  }

  async changeDocumentStatusModel(body) {
    return new Promise(async (resolve, reject) => {
      try {
        var query = `
                    UPDATE manage_documents
                    SET status = ?
                    WHERE id = ?`;
        var status = await promisePool.query(query, [body.status, body.document_id]);
        resolve(status);
      } catch (err) {
        reject(err);
      }
    });
  }
}

module.exports = new ManageDocumentsRepository();
