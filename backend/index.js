const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cron = require("node-cron");
require("dotenv").config();

// App and Server
const app = express();
const http = require("http").createServer(app);
const { Server } = require("socket.io");
const io = new Server(http, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});
global.io = io;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/users", require("./routes/users"));
app.use("/api/attendance", require("./routes/attendance"));
app.use("/api/wallet", require("./routes/wallet"));
app.use("/api/courses", require("./routes/courses"));
app.use("/api/transactions", require("./routes/transaction"));
app.use("/api/lectures", require("./routes/lecture"));
app.use("/api/dashboard", require("./routes/dashboard"));

app.get("/", (req, res) => {
  res.send("RFID Server Running 🚀");
});

// MongoDB connect and cron job
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    const Course = require("./models/Course");
    const Lecture = require("./models/Lecture");

    cron.schedule("* * * * *", async () => {
      const now = new Date();
      const today = now.toLocaleDateString("en-US", { weekday: "long" });

      try {
        const courses = await Course.find();

        for (const course of courses) {
          for (const timing of course.timings) {
            if (timing.day !== today) continue;

            const [startH, startM] = timing.timeStart.split(":").map(Number);
            const [endH, endM] = timing.timeEnd.split(":").map(Number);

            const start = new Date(now);
            start.setHours(startH, startM, 0, 0);

            const end = new Date(now);
            end.setHours(endH, endM, 0, 0);

            if (now > end) {
              const exists = await Lecture.findOne({
                courseCode: course.courseCode,
                day: timing.day,
                startTime: timing.timeStart,
                endTime: timing.timeEnd,
              });

              if (!exists) {
                await Lecture.create({
                  courseCode: course.courseCode,
                  courseName: course.courseName,
                  faculty: course.faculty,
                  teacherId: course.teachers?.[0] || null,
                  teacherName: course.teachers?.[0] || "",
                  day: timing.day,
                  startTime: timing.timeStart,
                  endTime: timing.timeEnd,
                  startDateTime: start,
                  endDateTime: end,
                  type: timing.type,
                  room: timing.room || "N/A",
                  status: "ended",
                  createdBy: "system",
                });

                console.log(`✅ Moved ended lecture: ${course.courseCode} ${timing.type} ${timing.timeStart}–${timing.timeEnd}`);

                io.emit("lecture-updated", {
                  type: "ended",
                  courseCode: course.courseCode,
                  startTime: timing.timeStart,
                  endTime: timing.timeEnd,
                  title: `${course.courseName} (${timing.type}) - ${timing.timeStart}–${timing.timeEnd}`
                });
              }
            }
          }
        }
      } catch (err) {
        console.error("❌ Auto-move lecture failed:", err.message);
      }
    });

    http.listen(process.env.PORT || 5000, () => {
      console.log(`✅ Server started on port ${process.env.PORT || 5000}`);
    });

    io.on("connection", (socket) => {
      console.log("🟢 Client connected:", socket.id);
    });

  })
  .catch((err) => console.error("MongoDB connection error:", err));
