class TestimonialRepo {
  constructor() {}

  async testimonialModel(body, uploadedFile) {
    return new Promise(async (resolve, reject) => {
      try {
        const [Testimonial] = await promisePool.query(
          `INSERT INTO testimonials(name, name_ar, description, description_ar, image, created_at, updated_at)
                Values(?, ?, ?, ?, ?, now(), now())`,
          [body.name, body.name_ar, body.description, body.description_ar, uploadedFile]
        );
        resolve(Testimonial);
      } catch (err) {
        reject(err);
      }
    });
  }

  async editTestimonialModel(body, uploadedFile) {
    return new Promise(async (resolve, reject) => {
        try {
            let query, queryParams;

            if (uploadedFile) {
                query = `UPDATE testimonials SET name = ?, name_ar = ?, description = ?, description_ar = ?, image = ? WHERE id = ?`;
                queryParams = [body.name, body.name_ar, body.description, body.description_ar, uploadedFile, body.id];
            } else {
                query = `UPDATE testimonials SET name = ?, name_ar = ?, description = ?, description_ar = ? WHERE id = ?`;
                queryParams = [body.name, body.name_ar, body.description, body.description_ar, body.id];
            }

            const [Testimonial] = await promisePool.query(query, queryParams);

            resolve(Testimonial);
        } catch (err) {
            reject(err);
        }
    });
}


  async listTestimonialsModel() {
    return new Promise(async (resolve, reject) => {
      try {
        const [Testimonial] = await promisePool.query(`SELECT * from testimonials`);
        resolve(Testimonial);
      } catch (err) {
        reject(err);
      }
    });
  }

  async getTestimonialRepo(payload) {
    return new Promise(async (resolve, reject) => {
      try {
        const [Testimonial] = await promisePool.query(`Select * from testimonials where id = ?`, [payload.id]);
        resolve(Testimonial);
      } catch (err) {
        reject(err);
      }
    });
  }

  async deleteTestimonialModel(body) {
    return new Promise(async (resolve, reject) => {
      try {
        const [deleteTestimonial] = await promisePool.query(
          `DELETE
                     FROM testimonials
                     where id = ?`,
          [body.id]
        );

        resolve(deleteTestimonial);
      } catch (err) {
        reject(err);
      }
    });
  }
}

module.exports = new TestimonialRepo();
