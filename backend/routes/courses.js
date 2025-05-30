const express = require("express");
const router = express.Router();
const Course = require("../models/Course");
const User = require("../models/User");

// Create a new course
router.post("/", async (req, res) => {
  try {
    const { courseCode, courseName,faculty, timings, teachers, students } = req.body;

    // Check if courseCode already exists
    const existing = await Course.findOne({ courseCode });
    if (existing) return res.status(400).json({ error: "Course code already exists." });

    const course = new Course({ courseCode, courseName,faculty, timings, teachers, students });
    await course.save();
    res.status(201).json(course);
  } catch (err) {
    console.error("❌ Course creation error:", err);
    res.status(500).json({ error: "Error creating course", details: err.message });
  }
  
});

// Get all courses
// Get all courses with teacher details
router.get("/", async (req, res) => {
  try {
    const courses = await Course.find().lean();
    const teachers = await User.find({ role: "teacher" }).lean();

    const teacherMap = {};
    teachers.forEach((t) => {
      teacherMap[t.userId] = `${t.fullName} (${t.userId})`;
    });

    // Attach teacher names to each course
    const enrichedCourses = courses.map(course => ({
      ...course,
      teacherDetails: course.teachers.map(tid => teacherMap[tid] || tid),
    }));

    res.json(enrichedCourses);
  } catch (err) {
    res.status(500).json({ error: "Error fetching courses" });
  }
});




// Update a course (can update timings, teachers, students)
router.put("/:id", async (req, res) => {
  try {
    const updated = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ error: "Course not found" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Error updating course" });
  }
});

// Delete a course
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Course.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Course not found" });
    res.json({ message: "Course deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Error deleting course" });
  }
});

// 📌 1. SEARCH TEACHERS - must come FIRST!
router.get("/search/teachers", async (req, res) => {
  try {
    const query = req.query.q?.toLowerCase() || "";
    const teachers = await User.find({ role: "teacher" });

    const filtered = teachers.filter((t) =>
      (t.userId?.toLowerCase().includes(query) || t.fullName?.toLowerCase().includes(query))
    );

    res.json(filtered.map((t) => ({ userId: t.userId, fullName: t.fullName })));
  } catch (err) {
    res.status(500).json({ error: "Error searching teachers", details: err.message });
  }
});

// 📌 2. GET COURSE BY ID - must come AFTER
router.get("/:id", async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ error: "Course not found" });
    res.json(course);
  } catch (err) {
    res.status(500).json({ error: "Error fetching course" });
  }
});

// Add student to course
router.post("/:id/students", async (req, res) => {
  const course = await Course.findById(req.params.id);
  const student = await User.findOne({ userId: req.body.studentId });

  if (!course || !student) return res.status(404).json({ error: "Not found" });

  if (!course.students.includes(req.body.studentId)) {
    course.students.push(req.body.studentId);
    await course.save();
  }

  res.json({ message: "Student enrolled" });
});


// Remove student from course
router.delete("/:id/students/:studentId", async (req, res) => {
  const course = await Course.findById(req.params.id);

  if (!course) return res.status(404).json({ error: "Course not found" });

  course.students = course.students.filter(id => id !== req.params.studentId);
  await course.save();

  res.json({ message: "Student removed" });
});
router.get("/suggest", async (req, res) => {
  try {
    const query = req.query.query || "";
    const regex = new RegExp(query, "i");

    const courses = await Course.find({ courseCode: regex }).limit(5);
    const suggestions = courses.map(c => c.courseCode);
    
    res.json(suggestions);
  } catch (err) {
    console.error("Course suggest failed:", err.message);
    res.status(500).json({ error: "Failed to fetch suggestions" });
  }
});

// GET all unique faculties for dropdown
router.get("/faculties", async (req, res) => {
  try {
    const faculties = await Faculty.find(); // check that Faculty is defined
    res.json(faculties);
  } catch (error) {
    console.error("Error fetching faculties:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});




module.exports = router;
