// import { reject } from "lodash";
// import { promisePool } from "../db";

class SliderRepo {
  constructor() {}

  async sliderModel(body, uploadedFile) {
    return new Promise(async (resolve, reject) => {
      //   console.log(page);
      try {
        const [slider] = await promisePool.query(
          `Insert Into slider(name,title,description,name_ar,title_ar,description_ar, image, created_at, updated_at)
                  VALUES (?,?, ?,?,?,?,?, now(), now())`,
          [body.name, body.title, body.description, body.name_ar, body.title_ar, body.description_ar, uploadedFile]
        );

        resolve(slider);
      } catch (err) {
        reject(err);
      }
    });
  }

  async editSliderModel(body, uploadedFile) {
    return new Promise(async (resolve, reject) => {
      try {
        const [slider] = await promisePool.query(`Update slider SET title = ? ,name=?,description=?,name_ar=?,title_ar=?,description_ar=?` + (uploadedFile != "" ? ` ,image = '${uploadedFile}' ` : "") + `where id = ?`, [body.title, body.name, body.description, body.name_ar, body.title_ar, body.description_ar, body.id]);

        resolve(slider);
      } catch (err) {
        reject(err);
      }
    });
  }

  async listSliderModel() {
    return new Promise(async (resolve, reject) => {
      try {
        const [list] = await promisePool.query(`SELECT * from slider`);
        resolve(list);
      } catch (err) {
        reject(err);
      }
    });
  }

  async getSliderRepo(payload) {
    return new Promise(async (resolve, reject) => {
      try {
        const [list] = await promisePool.query(`Select * from slider where id = ?`, [payload.id]);
        resolve(list);
      } catch (err) {
        reject(err);
      }
    });
  }

  async delete_sliderModel(body) {
    return new Promise(async (resolve, reject) => {
      try {
        const [delete_slider] = await promisePool.query(
          `DELETE
                     FROM slider
                     where id = ?`,
          [body.id]
        );

        resolve(delete_slider);
      } catch (err) {
        reject(err);
      }
    });
  }
}
module.exports = new SliderRepo();
