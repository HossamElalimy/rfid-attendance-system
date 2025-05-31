const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Course = require("../models/Course");
const Wallet = require("../models/Wallet");
const Attendance = require("../models/Attendance");
const Transaction = require("../models/Transaction");
const Lecture = require("../models/Lecture");

router.get("/summary", async (req, res) => {
  try {
    const year = parseInt(req.query.year) || new Date().getFullYear();

    const startOfYear = new Date(year, 0, 1);
    const endOfYear = new Date(year, 11, 31, 23, 59, 59, 999);

    const [
      totalStudents,
      totalTeachers,
      totalAdmins,
      totalDeans,
      totalViceDeans,
      totalParents,
      totalSecretaries,
      totalMerchants
    ] = await Promise.all([
      User.countDocuments({ role: "student" }),
      User.countDocuments({ role: "teacher" }),
      User.countDocuments({ role: "admin" }),
      User.countDocuments({ role: "dean" }),
      User.countDocuments({ role: "vice_dean" }),
      User.countDocuments({ role: "parent" }),
      User.countDocuments({ role: "secretary" }),
      User.countDocuments({ role: "merchant" }),
    ]);

    const rawCourses = await Course.find({}, "_id courseName");
    const courses = rawCourses.map(course => ({
      _id: course._id.toString(),
      courseName: course.courseName
    }));
    


    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const [
      transactionsToday,
      totalTransactions,
      purchasedTodayData,
      totalPurchasedData,
      totalWallets,
      wallets,
      totalLectures,
      totalLecturesToday,
      upcomingLecturesToday
    ] = await Promise.all([
      Transaction.countDocuments({ timestamp: { $gte: todayStart, $lte: todayEnd } }),
      Transaction.countDocuments(),

      Transaction.aggregate([
        {
          $match: {
            timestamp: { $gte: todayStart, $lte: todayEnd },
            action: "purchase"
          }
        },
        {
          $group: { _id: null, total: { $sum: "$amount" } }
        }
      ]),

      Transaction.aggregate([
        { $match: { action: "purchase" } },
        { $group: { _id: null, total: { $sum: "$amount" } } }
      ]),

      Wallet.countDocuments(),
      Wallet.find(),

      Lecture.countDocuments(),
      Lecture.countDocuments({
        startDateTime: { $gte: todayStart, $lte: todayEnd },
        status: "ended"
      }),
      Lecture.countDocuments({
        startDateTime: { $gte: todayStart, $lte: todayEnd },
        status: "upcoming"
      })
    ]);

    // Monthly Purchases Aggregation by Year
    const monthlyPurchasesAgg = await Transaction.aggregate([
      {
        $match: {
          action: "purchase",
          timestamp: { $gte: startOfYear, $lte: endOfYear }
        }
      },
      {
        $group: {
          _id: { $month: "$timestamp" },
          total: { $sum: "$amount" }
        }
      }
    ]);

    const monthlyPurchases = Array(12).fill(0);
    monthlyPurchasesAgg.forEach(item => {
      monthlyPurchases[item._id - 1] = item.total;
    });

    // Pie Chart: Purchases by Category (using merchantName)
    const categoryAgg = await Transaction.aggregate([
      {
        $match: {
          action: "purchase",
          timestamp: { $gte: startOfYear, $lte: endOfYear }
        }
      },
      {
        $group: {
          _id: "$merchantName", // Use "$category" if you prefer
          total: { $sum: "$amount" }
        }
      }
    ]);

    const categoryPurchases = categoryAgg.map(entry => ({
      label: entry._id || "Unknown",
      value: entry.total
    }));
    // Add in your summary route
    const now = new Date();
    const todayDay = now.toLocaleDateString("en-US", { weekday: "long" });
    
    const allCourses = await Course.find();
    
    let ongoingLectureCount = 0;

    for (const course of allCourses) {
      for (const timing of course.timings) {
        if (timing.day !== todayDay) continue;
    
        const [startH, startM] = timing.timeStart.split(":").map(Number);
        const [endH, endM] = timing.timeEnd.split(":").map(Number);
    
        const start = new Date(now);
        start.setHours(startH, startM, 0, 0);
    
        const end = new Date(now);
        end.setHours(endH, endM, 0, 0);
    
        if (now >= start && now <= end) {
          ongoingLectureCount++;
        }
      }
    }
    
    



    const totalWalletAmount = wallets.reduce((sum, w) => sum + (w.balance || 0), 0);

    const attendanceTotal = await Attendance.countDocuments();
    const attendanceMax = totalLectures * totalStudents || 1;
    const attendancePercent = Math.round((attendanceTotal / attendanceMax) * 100);
    // Calculate attendance for today only
const todayAttendanceCount = await Attendance.countDocuments({
  timestamp: { $gte: todayStart, $lte: todayEnd }
});

const lecturesToday = await Lecture.countDocuments({
  startDateTime: { $gte: todayStart, $lte: todayEnd }
});

const attendanceTodayMax = lecturesToday * totalStudents || 1;
const attendancePercentToday = Math.round((todayAttendanceCount / attendanceTodayMax) * 100);
const allLectures = await Lecture.find().sort({ startDateTime: -1 });

const lecturesDropdown = allLectures.map(l => ({
  id: l._id,
  title: l.title
}));
const totalCourses = await Course.countDocuments();




    res.json({
      totalStudents,
      totalTeachers,
      totalAdmins,
      totalDeans,
      totalViceDeans,
      totalParents,
      totalSecretaries,
      totalMerchants,
      totalCourses,
      totalLectures,
      totalLecturesToday,
      upcomingLecturesToday,
      totalWallets,
      totalWalletAmount,
      transactionsToday,
      totalTransactions,
      purchasedToday: purchasedTodayData[0]?.total || 0,
      totalPurchased: totalPurchasedData[0]?.total || 0,
      attendancePercent,
      monthlyPurchases,
      categoryPurchases, // ✅ For pie chart
      ongoingLectureCount,


      lecturesDropdown,
      attendancePercentToday,
      courses
    });
  } catch (err) {
    console.error("Dashboard summary failed:", err);
    res.status(500).json({ error: "Server error" });
  }
});
// 🆕 GET /summary/lecture-attendance?lectureId=xxxx
router.get("/summary/lecture-attendance", async (req, res) => {
  try {
    const { lectureId } = req.query;
    if (!lectureId) return res.status(400).json({ error: "Missing lectureId" });

    const lecture = await Lecture.findById(lectureId);
    if (!lecture) return res.status(404).json({ error: "Lecture not found" });

    const totalStudents = await User.countDocuments({ role: "student" });

    const attended = await Attendance.countDocuments({ lectureId });

    const percent = Math.round((attended / (totalStudents || 1)) * 100);

    res.json({ attendancePercent: percent, total: attended, max: totalStudents });
  } catch (err) {
    console.error("Lecture attendance error:", err);
    res.status(500).json({ error: "Server error" });
  }
});


module.exports = router;
