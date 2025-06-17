const Attendance = require("../models/Attendance");
const Course = require("../models/Course");

exports.getTeacherAnalytics = async (req, res) => {
    const { teacherId } = req.params;
    const { courseCode } = req.query;
  
    try {
      // 1️⃣ Get all teacher courses (filter by courseCode if provided)
      let courses = await Course.find({ teachers: { $in: [teacherId] } });
      if (courseCode) {
        courses = courses.filter(c => c.courseCode === courseCode);
      }
      const courseCodes = courses.map(c => c.courseCode);
  
      // 2️⃣ Get all attendance records for these course(s)
      const records = await Attendance.find({ courseCode: { $in: courseCodes } });
  
      // 3️⃣ Aggregate attendance data
      const totalCounts = { attended: 0, late: 0, absent: 0 };
      const byCourse = {};   // to calculate attendance rate per course
      const byDate = {};     // attended count per date
      const lateTrend = {};  // late count per date
      const missedDays = {}; // absent count per date
  
      for (const r of records) {
        const status = r.status ? r.status.toLowerCase() : ""; 
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
  
        // ✅ Date-based trends
        if (!byDate[day]) byDate[day] = { attended: 0 };
        if (status === "attended") byDate[day].attended++;
        if (!lateTrend[day]) lateTrend[day] = 0;
        if (status === "late") lateTrend[day]++;
  
        // ✅ Absent days tally (count only if absent)
        if (status === "absent") {
          missedDays[day] = (missedDays[day] || 0) + 1;
        }
      }
  
      // 4️⃣ Prepare chart datasets with sorting/filtering
      // 📊 Total counts for doughnut chart
      const totalCountsArr = [ totalCounts.attended, totalCounts.late, totalCounts.absent ];
  
      // 📊 Attendance rate by course (sorted descending by rate)
      const coursesArr = Object.entries(byCourse).map(([code, data]) => {
        const rate = data.total 
          ? ((data.attended / data.total) * 100).toFixed(1) 
          : "0.0";
        return { courseCode: code, attendanceRate: rate };
      });
      // Sort courses by attendanceRate (numerically, descending)
      coursesArr.sort((a, b) => parseFloat(b.attendanceRate) - parseFloat(a.attendanceRate));
  
      // 📈 Attendance trend over time (sorted by date ascending)
      const byDateArr = Object.entries(byDate).map(([date, data]) => ({
        date,
        attended: data.attended
      }));
      byDateArr.sort((a, b) => a.date.localeCompare(b.date));
  
      // 📈 Late trend over time (sorted by date ascending)
      const lateTrendArr = Object.entries(lateTrend).map(([date, count]) => ({ date, count }));
      lateTrendArr.sort((a, b) => a.date.localeCompare(b.date));
  
      // 📉 Top absent days (sorted by count descending, take top 5)
      const missedDaysArr = Object.entries(missedDays).map(([date, count]) => ({ date, count }));
      missedDaysArr.sort((a, b) => b.count - a.count);
      const topMissedDays = missedDaysArr.slice(0, 5);
  
      // 5️⃣ Send response
      res.json({
        totalCounts: totalCountsArr,
        courses: coursesArr,
        byDate: byDateArr,
        lateTrend: lateTrendArr,
        missedDays: topMissedDays
      });
    } catch (err) {
      console.error("Error in teacher analytics:", err.message);
      res.status(500).json({ error: "Server error" });
    }
  };
  