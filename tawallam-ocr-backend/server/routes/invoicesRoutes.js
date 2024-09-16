const express = require("express");
const router = express.Router();
const { loginRequired, validate } = require("@base/middleware");
const { addInvoiceSchema, updateInvoiceSchema, deleteInvoiceSchema, generalLedgerReportSchema } = require("@base/validation");
const { addInvoice, deleteInvoice, editInvoice, updateInvoice, listInvoices, readInvoice, erpAddCustomer, generalLedgerReport, erpPaymentModes, getProfitLossReports, getBalanceSheetReports, getCashFlowReports, getTrialBalanceReports, ListErpChartOfAccounts, addErpChartOfAccounts, addFiscalYear, ListErpFiscalYear, addFinanceBook, editChartOfAccountDetail, updateChartOfAccount, addJournalEntry12, ListJournalEntry,deleteErpFiscalYear } = require("@controllers/InvoicesController");

router.route("/addInvoice").post(validate(addInvoiceSchema), loginRequired, addInvoice);
router.route("/listInvoices").post(loginRequired, listInvoices);
router.route("/editInvoice").get(loginRequired, editInvoice);
router.route("/deleteInvoice").delete(validate(deleteInvoiceSchema), loginRequired, deleteInvoice);
router.route("/updateInvoice").post(validate(updateInvoiceSchema), loginRequired, updateInvoice);
router.route("/readInvoice").post(readInvoice);
router.route("/addErpCustomer").post(erpAddCustomer);
router.route("/listErpPaymentModes").get(erpPaymentModes);
router.route("/ListJournalEntry").get(loginRequired, ListJournalEntry);

// Reports start here
router.route("/generalLedgerReports").post(validate(generalLedgerReportSchema), loginRequired, generalLedgerReport);
router.route("/getProfitLossReports").post(loginRequired, getProfitLossReports);
router.route("/getBalanceSheetReports").post(loginRequired, getBalanceSheetReports);
router.route("/getCashFlowReports").post(loginRequired, getCashFlowReports);
router.route("/getTrialBalanceReports").post(loginRequired, getTrialBalanceReports);
// Reports end here

// Chart of accounts
router.route("/listErpChartOfAccounts").get(loginRequired, ListErpChartOfAccounts);
router.route("/addErpChartOfAccounts").post(loginRequired, addErpChartOfAccounts);
router.route("/editChartOfAccountDetail").get(loginRequired, editChartOfAccountDetail);
router.route("/updateChartOfAccount").put(loginRequired, updateChartOfAccount);

//Fiscal Years
router.route("/addFiscalYear").post(loginRequired, addFiscalYear);
router.route("/listErpFiscalYear").get(loginRequired, ListErpFiscalYear);
router.route("/deleteErpFiscalYear").delete(loginRequired, deleteErpFiscalYear);

//Finance Book
router.route("/addFinanceBook").post(loginRequired, addFinanceBook);

//Journal Entry
router.route("/addJournalEntry").post(loginRequired, addJournalEntry12);

module.exports = router;
