const fs = require("fs");
const path = require("path");

class ContactInformationRepository {
  constructor() {}
 
  async  updateContact(body, image) {
    return new Promise(async (resolve, reject) => {
      try {
        const [oldContact] = await promisePool.query(
          "SELECT image FROM contact_information_pages WHERE id = ?",
          [body.id]
        );
  
        let imageName = null;
        if (image) {
   
          imageName = `${Date.now()}_${image.name}`;
          const uploadPath = path.join(__dirname, "../../public/uploads", imageName);
  
          await image.mv(uploadPath);
          
       
          if (oldContact && oldContact[0].image) {
            const oldImagePath = path.join(
              __dirname,
              "../../public/uploads",
              oldContact[0].image
            );
            if (fs.existsSync(oldImagePath)) {
              fs.unlinkSync(oldImagePath);
            }
          }
        }
     
        const [result] = await promisePool.query(
          `UPDATE contact_information_pages 
           SET name = ?, name_ar = ?, title = ?, title_ar = ?, description = ?, description_ar = ?, 
               image = IFNULL(?, image), phone_number_title = ?, phone_number_title_ar = ?, 
               phone_number_value = ?, email_title = ?, email_title_ar = ?, email_value = ?, 
               address_title = ?, address_title_ar = ?, address_value = ?, address_value_ar = ?, 
               updated_at = now() 
           WHERE id = ?`,
          [
            body.name,
            body.name_ar,
            body.title,
            body.title_ar,
            body.description,
            body.description_ar,
            imageName,  
            body.phone_number_title,
            body.phone_number_title_ar,
            body.phone_number_value,
            body.email_title,
            body.email_title_ar,
            body.email_value,
            body.address_title,
            body.address_title_ar,
            body.address_value,
            body.address_value_ar,
            body.id,
          ]
        );
  
        resolve(result);
      } catch (err) {
        reject(err);
      }
    });
  }
  async  fetchContactInfo() {
    try {
      const [contactInfo] = await promisePool.query(`
        SELECT 
          id, 
          name, 
          name_ar, 
          title, 
          title_ar, 
          description, 
          description_ar, 
          image, 
          phone_number_title, 
          phone_number_title_ar, 
          phone_number_value, 
          email_title, 
          email_title_ar, 
          email_value, 
          address_title, 
          address_title_ar, 
          address_value, 
          address_value_ar 
        FROM contact_information_pages
        LIMIT 1
      `);
  

      if (!contactInfo.length) {
        return null;
      }
  

      if (contactInfo[0].image) {
        contactInfo[0].image = `${process.env.APP_BASE_URL}/public/uploads/${contactInfo[0].image}`;
      }
  
      return contactInfo[0];
    } catch (err) {
      throw err;
    }
  }
  
  
}

module.exports = new ContactInformationRepository();
