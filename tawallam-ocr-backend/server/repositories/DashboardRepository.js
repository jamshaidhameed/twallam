

class DashboardRepository {
  constructor() {}

  async DashboardCardsModel(company_id, role_id) {
    return new Promise(async (resolve, reject) => {
   
      try {
        const response = {
          invoices: 0,
          users: 0,
          companies: 0,
          individual:0,
          reports:0,
          subscription:0,
          payables:0,
          receivables: 0,
        };
      

        // super admin :: get companies
        if (role_id === 1) { 
          const [getCompanies] = await promisePool.query(
            "SELECT COUNT(*) AS count FROM users WHERE role_id = 2"
          );
          response.companies = getCompanies[0].count;

          const [getIndividual] = await promisePool.query(
            "SELECT COUNT(*) AS count FROM users WHERE role_id = 3"
          );
          response.individual = getIndividual[0].count;

          const [getSubscription]=await promisePool.query(
            "SELECT COUNT(*) AS count FROM subscription_packages"
          );
          response.subscription = getSubscription[0].count;

        }
       

        // super admin / companies :: get users
        if (role_id === 1 || role_id === 2) {
          const [getUser] = await promisePool.query(
            "SELECT COUNT(*) AS count FROM users WHERE super_parent_id = ?",
            [company_id]
          );
          response.users = getUser[0].count;
        }
       
        // companies / individual :: get invoices
        if (role_id === 2 || role_id === 3) {
        
          const [getInvoice] = await promisePool.query(
            "SELECT COUNT(*) AS count FROM invoices WHERE company_id = ?",
            [company_id]
          );
          response.invoices = getInvoice[0].count;

          const [getPaybles] = await promisePool.query(
            "SELECT COUNT(*) AS count FROM invoices WHERE company_id = ? AND type = 'payables'",
            [company_id]
          );
          response.payables = getPaybles[0].count;
      

          const [receivables] = await promisePool.query(
            "SELECT COUNT(*) AS count FROM invoices WHERE company_id = ? AND type = 'receivables'",
            [company_id]
          );
          response.receivables = receivables[0].count;


        }

        resolve(response);
      } catch (err) {
        reject(err);
      }
    });
  }

  async  InvoiceStatsModel(company_id) {
    return new Promise(async (resolve, reject) => {
      try {
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth() + 1;
  
        const startDate = new Date(currentDate.setMonth(currentDate.getMonth() - 5));
        const startYear = startDate.getFullYear();
        const startMonth = startDate.getMonth() + 1;
  
        const [stats] = await promisePool.query(
          `
          SELECT 
            YEAR(invoice_date) AS year,
            MONTH(invoice_date) AS month, 
            SUM(CASE WHEN type = 'payables' THEN total_amount ELSE 0 END) AS payables_revenue, 
            SUM(CASE WHEN type = 'receivables' THEN total_amount ELSE 0 END) AS receivables_revenue 
           
          FROM invoices
          WHERE company_id = ? AND invoice_date >= ? AND invoice_date <= ?
          GROUP BY YEAR(invoice_date), MONTH(invoice_date)
          ORDER BY YEAR(invoice_date), MONTH(invoice_date)
          `,
          [
            company_id,
            `${startYear}-${startMonth}-01`,
            `${currentYear}-${currentMonth}-31`,
          ]
        );
  
        const monthlyStats = Array.from({ length: 6 }, (_, i) => {
          const date = new Date();
          date.setMonth(date.getMonth() - (5 - i));
          return {
            month: date.toLocaleString("en", { month: "short" }),
            year: date.getFullYear(),
          
            payables_revenue: 0,
            receivables_revenue: 0,
          };
        });
  
        stats.forEach(({ year, month, payables_revenue, receivables_revenue }) => {
          const index = monthlyStats.findIndex(
            (stat) =>
              stat.year === year &&
              stat.month ===
                new Date(year, month - 1).toLocaleString("en", {
                  month: "short",
                })
          );
          if (index !== -1) {
       
            monthlyStats[index].payables_revenue = payables_revenue;
            monthlyStats[index].receivables_revenue = receivables_revenue;
          }
        });
  
        const response = {
          records: monthlyStats,
        };
  
        resolve(response);
      } catch (err) {
        reject(err);
      }
    });
  }
  
}
module.exports = new DashboardRepository();
