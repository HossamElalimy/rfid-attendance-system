const express = require("express");
const router = express.Router();
const User = require("../models/User");

// Helper: Generate role-based user ID
async function generateUserId(role) {
  const rolePrefix = {
    admin: "A",
    teacher: "T",
    parent: "P",
    student: "S"
  };

  const prefix = rolePrefix[role.toLowerCase()] || "U";
  const count = await User.countDocuments({ role });
  const number = (count + 1).toString().padStart(2, "0"); // e.g. 01, 02
  return prefix + number; // A01, T02, etc.
}

// ✅ CREATE user with userId
router.post("/", async (req, res) => {
  try {
    const userId = await generateUserId(req.body.role);
    const newUser = new User({ ...req.body, userId });
    await newUser.save();
    res.status(201).json(newUser);
  } catch (err) {
    console.error("Create user error:", err);
    res.status(400).json({ error: "Could not create user" });
  }
});

// ✅ UPDATE user
router.put("/:id", async (req, res) => {
  try {
    const updated = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: "Failed to update user" });
  }
});

// ✅ GET all users
router.get("/", async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ DELETE user
router.delete("/:id", async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted" });
  } catch (err) {
    res.status(400).json({ error: "Delete failed" });
  }
});

module.exports = router;
