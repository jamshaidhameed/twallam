class InvoiceReposiotry {
  constructor() {}

  async addInvoiceModel(data, file_uploaded) {
    return new Promise(async (resolve, reject) => {
      try {
        const [addInvoices] = await promisePool.query(
          `INSERT INTO invoices
                             (invoice_discount_amount,invoice_vat_amount,company_id,customer_id, delivery_date, payment_mode,invoice_date,invoice_number,total_vat,prepared_by,received_by,total_amount,sub_total_amount,payment_status,total_discount,po_number,type,paid_to,paid_from,is_draft, invoice_file, created_at, updated_at)
                         VALUES (?,?,?,?, ?, ?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?, now(), now())`,
          [data.invoice_discount_amount, data.invoice_vat_amount, data.company_id, data.customer_id, data.delivery_date, data.payment_mode, data.invoice_date, data.invoice_number, data.total_vat, data.prepared_by, data.received_by, data.total_amount, data.sub_total_amount, data.payment_status, data.total_discount, data.po_number, data.type, data.paid_to, data.paid_from, data.is_draft, file_uploaded]
        );
        var invoice_id = addInvoices.insertId;
        for (const invoice_detail of data.invoice_details) {
          await promisePool.query(
            `INSERT INTO invoice_detail
                             (invoice_id, product_name, quantity, price,total_price,vat_amount,discount_amount,` +
              (data.type === "expenses" ? ` paid_to , ` : "") +
              ` created_at, updated_at)
                         VALUES (?, ?, ?, ?,?,?,?,` +
              (data.type === "expenses" ? ` '${invoice_detail.paid_to}', ` : "") +
              ` now(), now())`,
            [invoice_id, invoice_detail.product_name, invoice_detail.quantity, invoice_detail.price, invoice_detail.total_price, invoice_detail.vat_amount, invoice_detail.discount_amount]
          );
        }

        resolve(addInvoices);
      } catch (err) {
        reject(err);
      }
    });
  }

  async deleteInvoiceModel(body) {
    return new Promise(async (resolve, reject) => {
      try {
        await promisePool.query(`DELETE FROM invoice_detail WHERE invoice_id = ?`, [body.id]);
        const [delete_invoice] = await promisePool.query(
          `DELETE
                         FROM invoices
                         where id = ?`,
          [body.id]
        );
        resolve(delete_invoice);
      } catch (err) {
        reject(err);
      }
    });
  }

  async editInvoiceModel(body) {
    return new Promise(async (resolve, reject) => {
      try {
        var [invoices] = await promisePool.query(`SELECT i.*,c.name,c.address,c.vat_number FROM invoices i JOIN customers c ON i.customer_id = c.id where i.id = ?`, [body.id]);

        resolve(invoices);
      } catch (err) {
        reject(err);
      }
    });
  }

  async isCustomerInvoiceExistModel(body) {
    return new Promise(async (resolve, reject) => {
      try {
        var [invoices] = await promisePool.query(`SELECT i.* FROM invoices i where i.customer_id = ?`, [body.id]);

        resolve(invoices);
      } catch (err) {
        reject(err);
      }
    });
  }

  async editInvoiceDetailModel(body) {
    return new Promise(async (resolve, reject) => {
      try {
        var [invoices] = await promisePool.query(`SELECT * FROM invoice_detail  where invoice_id = ?`, [body.id]);

        resolve(invoices);
      } catch (err) {
        reject(err);
      }
    });
  }

  async updateInvoiceModel(body) {
    return new Promise(async (resolve, reject) => {
      try {
        const [updateInvoice] = await promisePool.query(
          `UPDATE invoices SET
          invoice_vat_amount = ?,invoice_discount_amount = ?,delivery_date = ?, payment_mode = ?, invoice_date = ?,invoice_number = ?,total_vat = ?,prepared_by = ?,received_by=?, total_amount=?,sub_total_amount=?,payment_status=?,total_discount=?,po_number=?,paid_to=?,paid_from=?, updated_at = now()
                 WHERE id = ?`,
          [body.invoice_vat_amount, body.invoice_discount_amount, body.delivery_date, body.payment_mode, body.invoice_date, body.invoice_number, body.total_vat, body.prepared_by, body.received_by, body.total_amount, body.sub_total_amount, body.payment_status, body.total_discount, body.po_number, body.paid_to, body.paid_from, body.id]
        );

        var inputArray = [];

        if (body.invoice_details.length > 0) {
          for (const invoice_detail of body.invoice_details) {
            if (invoice_detail.detail_id) {
              await promisePool.query(
                `UPDATE invoice_detail SET
                           product_name = ?, quantity = ?,price=?,total_price=?,vat_amount=?,discount_amount=?` +
                  (body.type === "expenses" ? ` paid_to =? ` : "") +
                  `  WHERE invoice_id = ? AND id = ?`,
                [invoice_detail.product_name, invoice_detail.quantity, invoice_detail.price, invoice_detail.total_price, invoice_detail.vat_amount, invoice_detail.discount_amount, body.type === "expenses" ? invoice_detail.paid_to : null, body.id, invoice_detail.detail_id]
              );
              inputArray.push(invoice_detail.detail_id);
            } else {
              var [invoice_details] = await promisePool.query(
                `INSERT INTO invoice_detail
                             (invoice_id, product_name, quantity, price,total_price,vat_amount,discount_amount,` +
                  (body.type === "expenses" ? ` paid_to , ` : "") +
                  `created_at, updated_at)
                         VALUES (?, ?, ?, ?,?,?,?,` +
                  (body.type === "expenses" ? ` '${invoice_detail.paid_to}', ` : "") +
                  ` now(), now())`,
                [body.id, invoice_detail.product_name, invoice_detail.quantity, invoice_detail.price, invoice_detail.total_price, invoice_detail.vat_amount, invoice_detail.discount_amount]
              );

              inputArray.push(invoice_details.insertId);
            }
          }
        }
        const idString = inputArray.join(",");

        const query = `DELETE FROM invoice_detail WHERE invoice_id = ${body.id}  ` + (body.invoice_details.length > 0 ? `  AND id NOT IN (${idString}) ` : "") + ``;
        await promisePool.query(query);

        resolve(updateInvoice);
      } catch (err) {
        reject(err);
      }
    });
  }

  // async listInvoicesModel(params) {
  //   return new Promise(async (resolve, reject) => {
  //     try {
  //       var limit = params.limit;
  //       var skip = params.skip;
  //       var [get_invoice] = await promisePool.query(
  //         `SELECT i.*,c.id as customer_id,c.name,c.address,c.account_no,c.phone,c.mobile,
  //       c.company_id,c.vat_number from invoices i Left JOIN customers c ON i.customer_id = c.id where i.company_id=${params.company_id} ORDER BY i.id DESC LIMIT ? OFFSET ?`,
  //         [limit, skip]
  //       );

  //       const [total_records] = await promisePool.query(`SELECT count(i.id) as records FROM invoices i Left JOIN customers c ON i.customer_id = c.id where i.company_id=${params.company_id}`);

  //       var response = {
  //         records: get_invoice,
  //         total_records: total_records[0].records,
  //         limit: limit,
  //         pages: Math.ceil(total_records[0].records / limit),
  //       };

  //       resolve(response);
  //     } catch (err) {
  //       reject(err);
  //     }
  //   });
  // }
  async listInvoicesModel(params) {
    return new Promise(async (resolve, reject) => {
      try {
        const { limit, skip, company_id, from_date, to_date, is_draft, min_amount, max_amount, vendor, payment_mode, sort_column, sort_order, type } = params;
        const filters = [];
        const values = [];

        filters.push("i.company_id = ?");
        values.push(company_id);

        if (from_date) {
          filters.push("i.invoice_date >= ?");
          values.push(from_date);
        }
        if (to_date) {
          filters.push("i.invoice_date <= ?");
          values.push(to_date);
        }
        if (is_draft != undefined) {
          filters.push("i.is_draft = ?");
          values.push(is_draft);
        }
        if (min_amount) {
          filters.push("i.total_amount >= ?");
          values.push(min_amount);
        }
        if (max_amount) {
          filters.push("i.total_amount <= ?");
          values.push(max_amount);
        }
        if (vendor) {
          filters.push("i.customer_id = ?");
          values.push(vendor);
        }
        if (payment_mode) {
          filters.push("i.payment_mode = ?");
          values.push(payment_mode);
        }
        // if (type !== undefined) {
        //   filters.push("i.type = ?");
        //   values.push(type);
        // }

        if (is_draft === 1 && type === "payables") {
          filters.push("(i.type = ? OR i.type = ?)");
          values.push("payables", "expenses");
        } else if (type !== undefined) {
          filters.push("i.type = ?");
          values.push(type);
        }

        const filterQuery = filters.length > 0 ? " WHERE " + filters.join(" AND ") : "";

        const invoiceQuery = `
          SELECT i.*, c.id as customer_id, c.name, c.address, c.account_no, c.phone, c.mobile,
                 c.company_id, c.vat_number 
          FROM invoices i 
          LEFT JOIN customers c ON i.customer_id = c.id 
          ${filterQuery} 
          ORDER BY ${sort_column} ${sort_order} 
          LIMIT ? OFFSET ?`;

        const totalRecordsQuery = `
          SELECT count(i.id) as records 
          FROM invoices i 
          LEFT JOIN customers c ON i.customer_id = c.id 
          ${filterQuery}`;

        values.push(limit, skip);

        console.log("Invoice Query:", invoiceQuery);
        console.log("Values for Invoice Query:", values);

        const [get_invoice] = await promisePool.query(invoiceQuery, values);

        values.pop();
        values.pop();

        const [total_records] = await promisePool.query(totalRecordsQuery, values);

        const response = {
          records: get_invoice,
          total_records: total_records[0].records,
          limit: limit,
          pages: Math.ceil(total_records[0].records / limit),
        };

        resolve(response);
      } catch (err) {
        console.error("Error in listInvoicesModel:", err);
        reject(err);
      }
    });
  }

  async addUpdateErpItemModel(body) {
    return new Promise(async (resolve, reject) => {
      try {
        const [items] = await promisePool.query(`SELECT * from products where name='${body.product_name}'`);

        if (items.length === 0) {
          const [product] = await promisePool.query(
            `INSERT INTO products(name,price,created_at, updated_at)
              VALUES(?, ?,now(), now())`,
            [body.product_name, body.price]
          );
          resolve(product.insertId);
        } else {
          resolve(items[0].id);
        }
      } catch (err) {
        reject(err);
      }
    });
  }
  async getItemCodeModel(body) {
    return new Promise(async (resolve, reject) => {
      try {
        const cms = await promisePool.query(
          `Select * from products 
                   where name = ?`,
          [body.product_name]
        );
        // console.log("pro  man", cms);
        //  console.log("sales", cms[0][0]);
        resolve(cms[0][0]);
      } catch (err) {
        reject(err);
      }
    });
  }

  async updateErpItemModel(body) {
    return new Promise(async (resolve, reject) => {
      try {
        const [product_update] = await promisePool.query(
          `Update products SET erpnext_product_id	 = ?
                 where name = ?`,
          [body.item_code, body.product_name]
        );
        resolve(product_update);
      } catch (err) {
        reject(err);
      }
    });
  }
  async updateErpInvoiceModel(body) {
    return new Promise(async (resolve, reject) => {
      try {
        const [invoice] = await promisePool.query(
          `Update invoices SET erpnext_invoice_id = ?
                   where id = ?`,
          [body.erp_id, body.id]
        );

        resolve(invoice);
      } catch (err) {
        reject(err);
      }
    });
  }

  async updateErpInvoicePaymentModel(body) {
    return new Promise(async (resolve, reject) => {
      try {
        const [invoice] = await promisePool.query(
          `Update invoices SET erpnext_payment_id = ?
                   where id = ?`,
          [body.erp_id, body.id]
        );

        resolve(invoice);
      } catch (err) {
        reject(err);
      }
    });
  }

  async updateDraftStatusModel(body) {
    return new Promise(async (resolve, reject) => {
      try {
        const [invoice] = await promisePool.query(
          `Update invoices SET is_draft = ?
                   where id = ?`,
          [0, body.id]
        );

        resolve(invoice);
      } catch (err) {
        reject(err);
      }
    });
  }
}

module.exports = new InvoiceReposiotry();
