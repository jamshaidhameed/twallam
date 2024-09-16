class AboutReposiotry {
  constructor() {}

  async addAboutBannerModel(body, uploadedFile) {
    return new Promise(async (resolve, reject) => {
      try {
        if (body.id != undefined) {
          const [banner] = await promisePool.query(`Update manage_about_steps_sections SET title = ? ,section_id=?,long_description=?,title_ar=?,long_description_ar=?` + (uploadedFile != "" ? ` ,image = '${uploadedFile}' ` : "") + `where id = ?`, [body.title, body.step_id, body.long_description, body.title_ar, body.long_description_ar, body.id]);
          resolve(banner);
        } else {
          const [banner] = await promisePool.query(
            `Insert Into manage_about_steps_sections(title,section_id,long_description,title_ar,long_description_ar, image, created_at, updated_at)
                  VALUES (?, ?,?,?,?,?, now(), now())`,
            [body.title, body.step_id, body.long_description, body.title_ar, body.long_description_ar, uploadedFile]
          );
          resolve(banner);
        }
      } catch (err) {
        reject(err);
      }
    });
  }

  async getAboutStepsSectionDetailModel(payload) {
    return new Promise(async (resolve, reject) => {
      try {
        const [list] = await promisePool.query(`Select * from manage_about_steps_sections where section_id = ?`, [payload.id]);
        resolve(list);
      } catch (err) {
        reject(err);
      }
    });
  }

  async getAboutStepsSectionDetailByIdModel(payload) {
    return new Promise(async (resolve, reject) => {
      try {
        const [list] = await promisePool.query(`Select * from manage_about_steps_sections where id = ?`, [payload.id]);
        resolve(list);
      } catch (err) {
        reject(err);
      }
    });
  }

  async addAboutSectionOneModel(body, uploadedFile) {
    return new Promise(async (resolve, reject) => {
      try {
        if (body.id != undefined) {
          const [section_one] = await promisePool.query(`Update section_one SET title = ? ,description=?,title_ar=?,description_ar=?, updated_at=now()` + (uploadedFile != "" ? ` ,image = '${uploadedFile}' ` : "") + `where id = ?`, [body.title, body.description, body.title_ar, body.description_ar, body.id]);
          resolve(section_one);
        } else {
          const [section_one] = await promisePool.query(
            `Insert Into section_one(title,description,title_ar,description_ar, image, created_at, updated_at)
                  VALUES (?, ?,?,?,?, now(), now())`,
            [body.title, body.description, body.title_ar, body.description_ar, uploadedFile]
          );
          resolve(section_one);
        }
      } catch (err) {
        reject(err);
      }
    });
  }

  async getSectionOneDetailModel(payload) {
    return new Promise(async (resolve, reject) => {
      try {
        const [list] = await promisePool.query(`Select * from section_one where id = ?`, [payload.id]);
        resolve(list);
      } catch (err) {
        reject(err);
      }
    });
  }

  async addAboutSectionTwoModel(body) {
    return new Promise(async (resolve, reject) => {
      try {
        if (body.id != undefined) {
          const [section_two] = await promisePool.query(`Update section_two SET title = ? ,description=?,title_ar=?,description_ar=?,step_one_title = ? ,step_one_title_ar=?,step_one_description=?,step_one_description_ar=?,step_two_title = ? ,step_two_title_ar=?,step_two_description=?,step_two_description_ar=?,short_description=?,short_description_ar=?, updated_at=now() where id = ?`, [
            body.title,
            body.description,
            body.title_ar,
            body.description_ar,
            body.step_one_title,
            body.step_one_title_ar,
            body.step_one_description,
            body.step_one_description_ar,
            body.step_two_title,
            body.step_two_title_ar,
            body.step_two_description,
            body.step_two_description_ar,
            body.short_description,
            body.short_description_ar,
            body.id,
          ]);
          resolve(section_two);
        } else {
          const [section_two] = await promisePool.query(
            `Insert Into section_two(title,description,title_ar,description_ar,
            step_one_title,step_one_description,step_one_title_ar,step_one_description_ar, 
            step_two_title,step_two_description,step_two_title_ar,step_two_description_ar,short_description,short_description_ar, created_at, updated_at)
                  VALUES (?, ?,?,?,?,?,?,?,?,?,?,?,?,?, now(), now())`,
            [body.title, body.description, body.title_ar, body.description_ar, body.step_one_title, body.step_one_description, body.step_one_title_ar, body.step_one_description_ar, body.step_two_title, body.step_two_description, body.step_two_title_ar, body.step_two_description_ar, body.short_description, body.short_description_ar]
          );
          resolve(section_two);
        }
      } catch (err) {
        reject(err);
      }
    });
  }

  async getSectionTwoDetailModel(payload) {
    return new Promise(async (resolve, reject) => {
      try {
        const [list] = await promisePool.query(`Select * from section_two where id = ?`, [payload.id]);
        resolve(list);
      } catch (err) {
        reject(err);
      }
    });
  }

  async addAboutHowWeWorkModel(body) {
    return new Promise(async (resolve, reject) => {
      try {
        if (body.id != undefined) {
          const [how_we_work] = await promisePool.query(`Update how_we_work SET title = ? ,description=?,title_ar=?,description_ar=?,section_title = ? ,section_title_ar=?, updated_at=now() where id = ?`, [body.title, body.description, body.title_ar, body.description_ar, body.section_title, body.section_title_ar, body.id]);
          resolve(how_we_work);
        } else {
          const [how_we_work] = await promisePool.query(
            `Insert Into how_we_work(title,description,title_ar,description_ar,
            section_title,section_title_ar, created_at, updated_at)
                  VALUES (?, ?,?,?,?,?, now(), now())`,
            [body.title, body.description, body.title_ar, body.description_ar, body.section_title, body.section_title_ar]
          );
          resolve(how_we_work);
        }
      } catch (err) {
        reject(err);
      }
    });
  }

  async getHowWeWorkDetailModel() {
    return new Promise(async (resolve, reject) => {
      try {
        const [list] = await promisePool.query(`Select * from how_we_work`, []);
        resolve(list);
      } catch (err) {
        reject(err);
      }
    });
  }

  async getHowWeWorkDetailByIdModel(payload) {
    return new Promise(async (resolve, reject) => {
      try {
        const [list] = await promisePool.query(`Select * from how_we_work where id = ?`, [payload.id]);
        resolve(list);
      } catch (err) {
        reject(err);
      }
    });
  }
  async getTeamDetailByIdModel(payload) {
    return new Promise(async (resolve, reject) => {
      try {
        const [list] = await promisePool.query(`Select * from teams where id = ?`, [payload.id]);
        resolve(list);
      } catch (err) {
        reject(err);
      }
    });
  }
  async getTeamListModel() {
    return new Promise(async (resolve, reject) => {
      try {
        const [list] = await promisePool.query(`Select * from teams`, []);
        resolve(list);
      } catch (err) {
        reject(err);
      }
    });
  }

  async addAboutTeamModel(body, uploadedFile) {
    return new Promise(async (resolve, reject) => {
      try {
        if (body.id != undefined) {
          const [teams] = await promisePool.query(`Update teams SET name = ? ,designation=?,name_ar=?,designation_ar=?` + (uploadedFile != "" ? ` ,image = '${uploadedFile}' ` : "") + `where id = ?`, [body.name, body.designation, body.name_ar, body.designation_ar, body.id]);
          resolve(teams);
        } else {
          const [teams] = await promisePool.query(
            `Insert Into teams(name,designation,name_ar,designation_ar, image, created_at, updated_at)
                  VALUES (?, ?,?,?,?, now(), now())`,
            [body.name, body.designation, body.name_ar, body.designation_ar, uploadedFile]
          );
          resolve(teams);
        }
      } catch (err) {
        reject(err);
      }
    });
  }

  async deleteTeamModel(body) {
    return new Promise(async (resolve, reject) => {
      try {
        const [deleteTeam] = await promisePool.query(
          `DELETE
                     FROM teams
                     where id = ?`,
          [body.id]
        );

        resolve(deleteTeam);
      } catch (err) {
        reject(err);
      }
    });
  }
}

module.exports = new AboutReposiotry();
