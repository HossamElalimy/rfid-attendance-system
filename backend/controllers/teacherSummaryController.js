const User = require("../models/User");
const Course = require("../models/Course");
const Lecture = require("../models/Lecture");
const Attendance = require("../models/Attendance");

exports.getTeacherSummary = async (req, res) => {
  const { teacherId } = req.params;
  console.log("✅ API HIT: getTeacherSummary");
  console.log("➡️ TeacherID received:", teacherId);

  try {
    const now = new Date();
    const todayStr = now.toISOString().split("T")[0];
    const todayName = now.toLocaleDateString("en-US", { weekday: "long" });

    // 1. Get teacher's courses
    const courses = await Course.find({ teachers: { $in: [teacherId] } });
    const courseCodes = courses.map(c => c.courseCode);
    console.log("📚 Courses found:", courseCodes);

    // 2. Unique students
    const studentIds = new Set();
    courses.forEach(c => c.students.forEach(id => studentIds.add(id)));

    // 3. Total lectures
    const lectures = await Lecture.find({ courseCode: { $in: courseCodes } });

    // 4. Ended lectures today
    const startOfDay = new Date(now); startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(now); endOfDay.setHours(23, 59, 59, 999);
    const endedToday = await Lecture.countDocuments({
      courseCode: { $in: courseCodes },
      startDateTime: { $gte: startOfDay, $lte: endOfDay },
      status: "ended"
    });

    // 5. Attendance taken today
    const attendanceTakenToday = await Attendance.countDocuments({
      courseCode: { $in: courseCodes },
      date: todayStr
    });
    const pendingLecturesToday = endedToday - attendanceTakenToday;

    // 6. Upcoming lectures today
    const upcomingToday = courses.reduce((sum, course) => {
      return sum + course.timings.filter(t => {
        if (t.day !== todayName) return false;
        const time = t.timeStart.length === 5 ? t.timeStart + ":00" : t.timeStart;
        const dt = new Date(`${todayStr}T${time}`);
        return dt > now;
      }).length;
    }, 0);

    // 7. Ongoing lectures now
    let ongoingLectures = [];
    try {
      ongoingLectures = await Course.aggregate([
        { $match: { teachers: { $in: [teacherId] } } },
        { $unwind: "$timings" },
        { $match: { "timings.day": todayName } },
        {
          $addFields: {
            start: {
              $dateFromString: {
                dateString: {
                  $concat: [
                    { $dateToString: { format: "%Y-%m-%d", date: now } },
                    "T",
                    "$timings.timeStart"
                  ]
                }
              }
            },
            end: {
              $dateFromString: {
                dateString: {
                  $concat: [
                    { $dateToString: { format: "%Y-%m-%d", date: now } },
                    "T",
                    "$timings.timeEnd"
                  ]
                }
              }
            }
          }
        },
        {
          $match: {
            start: { $lte: now },
            end: { $gte: now }
          }
        }
      ]);
    } catch (aggErr) {
      console.error("⚠️ Aggregation failed:", aggErr.message);
    }

    // 8. Per-course attendance breakdown
    const courseSummaries = [];
    for (const course of courses) {
      const attendanceRecords = await Attendance.find({ courseCode: course.courseCode });

      const attended = attendanceRecords.filter(a => a.status === "Attended").length;
      const late = attendanceRecords.filter(a => a.status === "Late").length;
      const absent = attendanceRecords.filter(a => a.status === "Absent").length;
      const total = attended + late + absent;

      const calcRate = (num) => (total ? ((num / total) * 100).toFixed(1) : "0.0");

      courseSummaries.push({
        courseCode: course.courseCode,
        attendance: attended,
        late,
        absent,
        attendanceRate: calcRate(attended),
        lateRate: calcRate(late),
        absentRate: calcRate(absent)
      });
    }

    // ✅ Send response
    res.json({
      totalCourses: courses.length,
      totalStudents: studentIds.size,
      totalLectures: lectures.length,
      endedToday,
      upcomingToday,
      ongoingLectures: ongoingLectures.length,
      attendanceTakenToday,
      pendingLecturesToday,
      courses: courseSummaries
    });
  } catch (err) {
    console.error("Teacher summary error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
