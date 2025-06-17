const express = require("express");
const router = express.Router();
const { getTeacherAnalytics } = require("../controllers/teacherAnalyticsController");

router.get("/:teacherId", getTeacherAnalytics);

module.exports = router;
