const Course = require("../models/Course");
const User = require("../models/User");
const Attendance = require("../models/Attendance");

exports.getLectureStudents = async (req, res) => {
  try {
    const { timingId } = req.params;
    const course = await Course.findOne({ "timings._id": timingId });

    if (!course) return res.status(404).json({ message: "Lecture not found" });

    const students = await User.find({ userId: { $in: course.students } });

    res.json({
      students,
      courseCode: course.courseCode,
      courseName: course.courseName,
      timing: course.timings.id(timingId),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.submitAttendance = async (req, res) => {
  try {
    const { timingId, date, records } = req.body;

    const course = await Course.findOne({ "timings._id": timingId });
    if (!course) return res.status(404).json({ message: "Course not found" });

    const timing = course.timings.id(timingId);
    const { day, timeStart, timeEnd, type, room } = timing;

    const entries = records.map((r) => ({
      studentId: r.studentId,
      courseCode: course.courseCode,
      courseName: course.courseName,
      startTime: timeStart,
      endTime: timeEnd,
      room: room || "N/A",
      date,
      day,
      status: r.status,
      loginTime: r.loginTime || null,
      logoutTime: r.logoutTime || null,
    }));

    await Attendance.insertMany(entries);

    // ✅ Emit live update
    const io = req.app.get("io");
    io.emit("attendance-updated", timingId); // matching frontend listener

    res.json({ message: "Attendance submitted successfully." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

