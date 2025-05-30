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

    const totalCourses = await Course.countDocuments();

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

      // ✅ FIXED: action instead of type
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

      // ✅ Count of all ended lectures since 29/5
      Lecture.countDocuments(), // ✅ total number of lectures, no filters


      // ✅ Count of today's ended lectures
      Lecture.countDocuments({
        startDateTime: { $gte: todayStart, $lte: todayEnd },
        status: "ended"
      }),

      // ✅ Count of today's upcoming lectures
      Lecture.countDocuments({
        startDateTime: { $gte: todayStart, $lte: todayEnd },
        status: "upcoming"
      })
    ]);

    // 🧠 Group purchase amounts by month
// 🧠 Group deduct amounts by month (treating them as purchases)
const monthlyPurchasesAgg = await Transaction.aggregate([
  {
    $match: {
      action: "purchase", // CHANGED from "purchase"
      timestamp: { $gte: new Date(new Date().getFullYear(), 0, 1) }
    }
  },
  {
    $group: {
      _id: { $month: "$timestamp" },
      total: { $sum: "$amount" }
    }
  }
]);


// 🧮 Build an array of 12 months initialized to 0
console.log("monthlyPurchasesAgg:", monthlyPurchasesAgg);

const monthlyPurchases = Array(12).fill(0);
monthlyPurchasesAgg.forEach(item => {
  monthlyPurchases[item._id - 1] = item.total;
});


    const totalWalletAmount = wallets.reduce((sum, w) => sum + (w.balance || 0), 0);

    const attendanceTotal = await Attendance.countDocuments();
    const attendanceMax = totalLectures * totalStudents || 1;
    const attendancePercent = Math.round((attendanceTotal / attendanceMax) * 100);

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
      monthlyPurchases

    });
  } catch (err) {
    console.error("Dashboard summary failed:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
