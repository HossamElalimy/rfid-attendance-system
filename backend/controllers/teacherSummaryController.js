const Course = require("../models/Course");
const Attendance = require("../models/Attendance");

exports.getTeacherSummary = async (req, res) => {
  try {
    const { userId } = req.params;
    const courses = await Course.find({ teachers: userId });

    let totalLectures = 0;
    let endedToday = 0;
    let upcomingToday = 0;
    let ongoingLectures = 0;
    let attendanceTakenToday = 0;
    const courseSummaries = [];
    const studentSet = new Set();

    const now = new Date();
    const todayStr = now.toISOString().split("T")[0];
    const day = now.toLocaleDateString("en-US", { weekday: "long" });
    const nowMinutes = now.getHours() * 60 + now.getMinutes();

    for (const course of courses) {
      totalLectures += course.timings.length;
      course.students.forEach(sid => studentSet.add(sid));

      for (const timing of course.timings) {
        if (timing.day !== day) continue;

        const [sh, sm] = timing.timeStart.split(":").map(Number);
        const [eh, em] = timing.timeEnd.split(":").map(Number);
        const start = sh * 60 + sm;
        const end = eh * 60 + em;

        if (nowMinutes < start) upcomingToday++;
        else if (nowMinutes >= start && nowMinutes <= end) ongoingLectures++;
        else endedToday++;

        const count = await Attendance.countDocuments({
          courseCode: course.courseCode,
          date: todayStr,
          startTime: timing.timeStart,
          endTime: timing.timeEnd,
        });
        if (count > 0) attendanceTakenToday++;
      }

      const allAttendance = await Attendance.find({ courseCode: course.courseCode });
      const total = allAttendance.length;
      const attended = allAttendance.filter(a => a.status === "Attended").length;
      const late = allAttendance.filter(a => a.status === "Late").length;
      const absent = allAttendance.filter(a => a.status === "Absent").length;

      courseSummaries.push({
        courseCode: course.courseCode,
        attendance: attended,
        attendanceRate: total ? ((attended / total) * 100).toFixed(1) : 0,
        late,
        lateRate: total ? ((late / total) * 100).toFixed(1) : 0,
        absent,
        absentRate: total ? ((absent / total) * 100).toFixed(1) : 0,
      });
    }

    res.json({
      totalCourses: courses.length,
      totalLectures,
      endedToday,
      upcomingToday,
      ongoingLectures,
      attendanceTakenToday,
      pendingLecturesToday: totalLectures - attendanceTakenToday,
      totalStudents: studentSet.size,
      endedLectures: endedToday,
      courses: courseSummaries
    });
  } catch (err) {
    console.error("Summary error:", err.message);
    res.status(500).json({ error: "Failed to fetch summary" });
  }
};
