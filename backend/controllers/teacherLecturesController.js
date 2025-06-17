const Course = require("../models/Course");

exports.getLiveTeacherLectures = async (req, res) => {
  try {
    const { teacherId } = req.params;
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];
    const weekday = today.toLocaleDateString("en-US", { weekday: "long" });

    const courses = await Course.find({ teachers: teacherId });

    const result = [];

    for (const course of courses) {
      for (const timing of course.timings) {
        if (timing.day !== weekday) continue;

        const start = new Date(`${todayStr}T${timing.timeStart}`);
        const end = new Date(`${todayStr}T${timing.timeEnd}`);
        const now = new Date();

        const status =
          now < start ? "Upcoming" : now > end ? "Ended" : "Ongoing";

        result.push({
          courseCode: course.courseCode,
          courseName: course.courseName,
          faculty: course.faculty,
          startTime: timing.timeStart,
          endTime: timing.timeEnd,
          day: timing.day,
          room: timing.room || "N/A",
          type: timing.type,
          timingId: timing._id,
          status,
        });
      }
    }

    res.json(result.sort((a, b) => a.startTime.localeCompare(b.startTime)));
  } catch (err) {
    console.error("Lecture fetch error:", err);
    res.status(500).json({ error: "Failed to load teacher lectures" });
  }
};
