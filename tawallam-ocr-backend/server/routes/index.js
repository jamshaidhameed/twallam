const { apiResponse } = require("@utils");
const config = require("@config");
const authRoutes = require("./authRoutes");
const subAdminRoutes = require("./subAdminRoutes");
const modulePermissionRoutes = require("./modulePermissionRoutes");
const subscriptionRoutes = require("./subscriptionRoutes");
const testimonialRoutes = require("./testimonialRoutes");
const contactRoutes = require("./contactRoutes");
const userRoutes = require("./userRoutes");
const mediaRoutes = require("./mediaRoutes");
const contentRoutes = require("./contentRoutes");
const invoicesRoutes = require("./invoicesRoutes");
const ContactContentRoutes = require("./ContactContentRoutes");
// const mailRoutes = require("./mailRoutes");
const customerRoutes = require("./customerRoutes");
const pagesRoutes = require("./pagesRoutes");
const sliderRoutes = require("./sliderRoutes");
const CmsPageRoutes = require("./CmsPageRoutes");
const GeneralRoutes = require("./GeneralRoutes");
const manageDocumentsRoutes = require("./manageDocumentsRoutes");
const DashboardRoutes = require("./dashboardRoutes");
const AboutRoutes = require("./aboutRoutes");
const zidRoutes = require("./zidRoutes");

const contactInformationRoutes = require('./ContactInformationRoutes');

module.exports = (app) => {
  app.use(`/${config.apiPrefix}`, authRoutes);
  app.use(`/${config.apiPrefix}`, modulePermissionRoutes);
  app.use(`/${config.apiPrefix}`, subscriptionRoutes);
  app.use(`/${config.apiPrefix}`, testimonialRoutes);
  app.use(`/${config.apiPrefix}`, subAdminRoutes);
  app.use(`/${config.apiPrefix}`, contactRoutes);
  app.use(`/${config.apiPrefix}`, userRoutes);
  app.use(`/${config.apiPrefix}`, mediaRoutes);
  app.use(`/${config.apiPrefix}`, contentRoutes);
  app.use(`/${config.apiPrefix}`, invoicesRoutes);
  app.use(`/${config.apiPrefix}`, ContactContentRoutes);
  // app.use(`/${config.apiPrefix}`, mailRoutes);
  app.use(`/${config.apiPrefix}`, customerRoutes);
  app.use(`/${config.apiPrefix}`, pagesRoutes);
  app.use(`/${config.apiPrefix}`, sliderRoutes);
  app.use(`/${config.apiPrefix}`, CmsPageRoutes);
  app.use(`/${config.apiPrefix}`, GeneralRoutes);
  app.use(`/${config.apiPrefix}`, AboutRoutes);
  app.use(`/auth/zid`, zidRoutes);

  app.use(`/${config.apiPrefix}`, manageDocumentsRoutes);

  app.use(`/${config.apiPrefix}`, DashboardRoutes);
  
  app.use(`/${config.apiPrefix}`, contactInformationRoutes);

  app.use(`/${config.apiPrefix}`, (req, res) => {
    return apiResponse(req, res, {}, 404, `No API route found: ${config.apiPrefix}${req.path}`);
  });
};
