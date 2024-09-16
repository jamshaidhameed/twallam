class CustomerRepo {
  constructor() {}

  async addCustomerModel(body) {
    return new Promise(async (resolve, reject) => {
      try {
        body.account_no = body.account_no || "";
        body.mobile = body.mobile || "";
        body.phone = body.phone || "";
        body.email = body.email || "";
        body.zid_customer_id = body.zid_customer_id || "";
        body.erpnext_customer_id = body.erpnext_customer_id || "";
        const [Customer] = await promisePool.query(
          `
            INSERT INTO customers(company_id, name, address, account_no, phone, mobile,vat_number,type, email, zid_customer_id, erpnext_customer_id, created_at, updated_at)
            VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, now(), now())`,
          [body.company_id, body.name, body.address, body.account_no, body.phone, body.mobile, body.vat_number, body.customer_or_supplier, body.email, body.zid_customer_id, body.erpnext_customer_id]
        );
        resolve(Customer.insertId);
      } catch (err) {
        reject(err);
      }
    });
  }
  async editCustomerModel(body) {
    return new Promise(async (resolve, reject) => {
      try {
        body.account_no = body.account_no !== "" ? body.account_no : "";
        body.mobile = body.mobile !== "" ? body.mobile : "";
        body.phone = body.phone !== "" ? body.phone : "";

        const [Customer] = await promisePool.query(
          `Update customers SET  name = ?, address = ?, account_no = ?, phone = ?,vat_number=?,mobile = ?
                   where id = ?`,
          [body.name, body.address, body.account_no, body.phone, body.vat_number, body.mobile, body.id]
        );

        resolve(Customer);
      } catch (err) {
        reject(err);
      }
    });
  }

  async getCustomerModel(body) {
    return new Promise(async (resolve, reject) => {
      try {
        const [Customer] = await promisePool.query(
          `Select * from customers 
                   where id = ?`,
          [body.id]
        );
        resolve(Customer);
      } catch (err) {
        reject(err);
      }
    });
  }

  async getCustomerByVatNumberModel(body) {
    return new Promise(async (resolve, reject) => {
      try {
        let type = "customer";
        if (body.type == "payables" || body.type === "expenses" || body.type == "supplier") {
          type = "supplier";
        }
        const [customer] = await promisePool.query(
          `Select * from customers 
                   where vat_number = ? and type=? and company_id=?`,
          [body.vat_number, type, body.company_id]
        );
        resolve(customer);
      } catch (err) {
        reject(err);
      }
    });
  }

  async getCustomerByZidCustomerEmail(email) {
    return new Promise(async (resolve, reject) => {
      try {
        const [customer] = await promisePool.query(
            `Select * from customers 
                   where email = ?`,
            [email]
        );
        resolve(customer);
      } catch (err) {
        reject(err);
      }
    });
  }

  async checkItsVatNoModel(body) {
    return new Promise(async (resolve, reject) => {
      try {
        const [customer] = await promisePool.query(
          `Select * from customers 
                   where vat_number = ? and company_id=? and id!=?`,
          [body.vat_number, body.company_id, body.id]
        );

        resolve(customer);
      } catch (err) {
        reject(err);
      }
    });
  }
  async listCustomersModel(company_id, type, is_zid) {
    console.log('is_zid',is_zid)
    return new Promise(async (resolve, reject) => {
      try {

        if (is_zid === 'yes'){


          const [Customer] = await promisePool.query(      `Select * from customers 
                   where zid_customer_id != ?`,
              ['null']);
          console.log('Customerdd',Customer)
          resolve(Customer);
        }
        else {
          let query = "SELECT * FROM customers WHERE company_id = ? AND zid_customer_id = ?";
          const queryParams = [company_id, 0];
          if (type !== undefined) {
            query += " AND type = ?";
            queryParams.push(type);
          }

          if (is_zid === 'no') {
            query += " AND zid_customer_id = ?";
            queryParams.push(0);
          }


          const [Customer] = await promisePool.query(query, queryParams);
          console.log('Customer',Customer)
          console.log('query',query)
          console.log('queryParams',queryParams)

          resolve(Customer);
        }


      } catch (err) {
        reject(err);
      }
    });
  }
  async deleteCustomerModel(body) {
    return new Promise(async (resolve, reject) => {
      try {
        const [deleteCustomer] = await promisePool.query(
          `DELETE
                     FROM customers
                     where id = ?`,
          [body.id]
        );

        resolve(deleteCustomer);
      } catch (err) {
        reject(err);
      }
    });
  }

  async updateErpCustomerModel(erp_id, customer_id) {
    return new Promise(async (resolve, reject) => {
      try {
        const [Customer] = await promisePool.query(
          `Update customers SET  erpnext_customer_id = ?
                   where id = ?`,
          [erp_id, customer_id]
        );

        resolve(Customer);
      } catch (err) {
        reject(err);
      }
    });
  }
}
module.exports = new CustomerRepo();
