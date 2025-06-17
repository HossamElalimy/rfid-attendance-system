const express = require("express");
const router = express.Router();

const { getTeacherSummary } = require("../controllers/teacherSummaryController");
const { getLectureStudents, submitAttendance } = require("../controllers/teacherAttendanceController");
const { getLiveTeacherLectures, getTeacherCourses } = require("../controllers/teacherLecturesController");

router.get("/summary/:teacherId", getTeacherSummary);
router.get("/lecture-students/:timingId", getLectureStudents);
router.post("/submit-attendance", submitAttendance);
router.get("/live-lectures/:teacherId", getLiveTeacherLectures);
router.get("/courses/:teacherId", getTeacherCourses);

module.exports = router;
