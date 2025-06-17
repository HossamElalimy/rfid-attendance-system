const Attendance = require("../models/Attendance");
const Course = require("../models/Course");

exports.getTeacherAnalytics = async (req, res) => {
  const { teacherId } = req.params;
  const { courseCode } = req.query;

  try {
    // 1️⃣ Get all teacher courses
    let courses = await Course.find({ teachers: { $in: [teacherId] } });
    if (courseCode) {
      courses = courses.filter(c => c.courseCode === courseCode);
    }
    const courseCodes = courses.map(c => c.courseCode);

    // 2️⃣ Get attendance records
    const records = await Attendance.find({ courseCode: { $in: courseCodes } });

    const totalCounts = { attended: 0, late: 0, absent: 0 };
    const byCourse = {};
    const byDate = {};       // for trend chart
    const lateTrend = {};    // for late line chart
    const missedDays = {};   // for absent bar chart

    for (const r of records) {
      const status = r.status?.toLowerCase();
      if (!status) continue;

      const day = r.date;
      const cc = r.courseCode;

      // ✅ Count Totals
      if (status === "attended") totalCounts.attended++;
      if (status === "late") totalCounts.late++;
      if (status === "absent") totalCounts.absent++;

      // ✅ Course-level stats
      if (!byCourse[cc]) byCourse[cc] = { total: 0, attended: 0 };
      byCourse[cc].total++;
      if (status === "attended") byCourse[cc].attended++;

      // ✅ Date-based trend
      if (!byDate[day]) byDate[day] = { attended: 0 };
      if (status === "attended") byDate[day].attended++;

      // ✅ Late trend
      if (!lateTrend[day]) lateTrend[day] = 0;
      if (status === "late") lateTrend[day]++;

      // ✅ Missed days (absent)
      if (!missedDays[day]) missedDays[day] = 0;
      if (status === "absent") missedDays[day]++;
    }

    res.json({
      totalCounts: [
        totalCounts.attended,
        totalCounts.late,
        totalCounts.absent
      ],

      // 📊 Course-wise rates
      courses: Object.entries(byCourse).map(([courseCode, data]) => ({
        courseCode,
        attendanceRate: data.total ? ((data.attended / data.total) * 100).toFixed(1) : 0
      })),

      // 📈 Trend over time (line chart)
      byDate: Object.entries(byDate).map(([date, d]) => ({
        date,
        attended: d.attended
      })),

      // ⚠️ Late Attendance over Time
      lateTrend: Object.entries(lateTrend).map(([date, count]) => ({
        date,
        count
      })),

      // ❌ Most Missed Days
      missedDays: Object.entries(missedDays).map(([date, count]) => ({
        date,
        count
      }))
    });
  } catch (err) {
    console.error("Error in teacher analytics:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};
