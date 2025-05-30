const express = require("express");
const router = express.Router();
const Lecture = require("../models/Lecture");
const Course = require("../models/Course");
const Attendance = require("../models/Attendance");



// GET /api/lectures?date=2025-05-29&search=cs101&faculty=Engineering
router.get("/", async (req, res) => {
  try {
    const { date, course = "", teacher = "", faculty = "" } = req.query;

    const todayDateStr = date || new Date().toISOString().split("T")[0]; // ✅ you forgot this!
    const selectedDay = new Date(todayDateStr).toLocaleDateString("en-US", { weekday: "long" }); // ✅ and this!

    const filterRegex = {
      course: new RegExp(course, "i"),
      teacher: new RegExp(teacher, "i")
    };

    const rawCourses = await Course.find({
      ...(faculty && { faculty }),
      ...(course && { courseCode: filterRegex.course }),
      ...(teacher && {
        $or: [
          { teacherName: filterRegex.teacher },
          { teachers: { $elemMatch: { $regex: filterRegex.teacher } } }
        ]
      })
    });

    const flattenedLectures = [];

    for (const course of rawCourses) {
      for (const timing of course.timings.filter(t => t.day === selectedDay)) {
        const attendanceCount = await Attendance.countDocuments({
          courseCode: course.courseCode,
          day: timing.day,
          startTime: timing.timeStart,
          endTime: timing.timeEnd,
        });
    
        flattenedLectures.push({
          courseCode: course.courseCode,
          courseName: course.courseName,
          faculty: course.faculty,
          teacherName: course.teachers?.join(", "),
          day: timing.day,
          startTime: timing.timeStart,
          endTime: timing.timeEnd,
          type: timing.type,
          room: timing.room || "N/A",
          createdBy: course.createdBy || null,
          startDateTime: new Date(`${todayDateStr}T${timing.timeStart}`),
          endDateTime: new Date(`${todayDateStr}T${timing.timeEnd}`),
          attendanceCount,
          enrolledCount: course.students?.length || 0
        });
      }
    }
    

    res.json(flattenedLectures);
  } catch (err) {
    console.error("❌ Fetch lectures failed:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});




router.get("/faculties", async (req, res) => {
  try {
    const faculties = await Lecture.distinct("faculty");
    res.json(faculties);
  } catch (err) {
    res.status(500).json({ error: "Failed to get faculties", details: err.message });
  }
});


module.exports = router;
