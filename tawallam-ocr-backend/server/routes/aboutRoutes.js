const express = require("express");
const router = express.Router();
const { loginRequired, validate } = require("@base/middleware");

const { manageSectionSteps, getSectionStepsDetail, manageHowWeWork, getHowWeWorkList, manageTeam, getTeamList, teamDetail, getHowWeWorkDetail, deleteTeam } = require("@controllers/AboutController");

router.route("/about/manageSectionSteps").post(loginRequired, manageSectionSteps);
router.route("/about/getSectionStepsDetail").get(getSectionStepsDetail);

//detail required
// router.route("/about/manageHowWeWork").post(loginRequired, manageHowWeWork);
// router.route("/about/listHowWeWork").get(getHowWeWorkList);
// router.route("/about/howWeWorkDetail").get(getHowWeWorkDetail);

//detail required
router.route("/about/manageTeam").post(loginRequired, manageTeam);
router.route("/about/listTeam").get(getTeamList);
router.route("/about/teamDetail").get(teamDetail);
router.route("/about/deleteTeam").delete(loginRequired, deleteTeam);

module.exports = router;
