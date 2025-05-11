const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");

// Helper: Generate role-based user ID
async function generateUserId(role) {
  const rolePrefix = {
    admin: "A",
    teacher: "T",
    parent: "P",
    student: "S",
    merchant: "M"
  };

  const prefix = rolePrefix[role.toLowerCase()] || "U";
  const count = await User.countDocuments({ role });
  const number = (count + 1).toString().padStart(2, "0"); // e.g. 01, 02
  return prefix + number; // A01, T02, M01, etc.
}

// POST request to create user
router.post("/", async (req, res) => {
  try {
    console.log("Creating user with data:", req.body);  // <-- Add this line here
    const { username,fullName, email, password, phoneNumber, role, status, faculty, year, merchantName, merchantType,studentID  } = req.body;

    // Check if the username or email already exists
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(400).json({ error: "Username or email already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const userId = await generateUserId(role); // Generate ID based on role

    let newUser;
    if (role === "merchant") {
      newUser = new User({
        username,
        fullName,
        email,
        password: hashedPassword,
        phoneNumber,
        role,
        status,
        merchantName,
        merchantType,
        userId,
        
      });
    } else if (role === "parent") {
      // For parents, include studentID
      if (!studentID) {
        return res.status(400).json({ error: "Parent must be linked to a student." });
      }
    
      newUser = new User({
        username,
        fullName,
        email,
        password: hashedPassword,
        phoneNumber,
        role,
        status,
        studentID, // Set studentID for parent role
        userId
      });
    }
    
    else {
      newUser = new User({
        username,
        fullName,
        email,
        password: hashedPassword,
        phoneNumber,
        role,
        status,
        faculty,
        year,
        userId
      });
    }

    await newUser.save();
    res.status(201).json(newUser); // Success response
  } catch (err) {
    console.error("Error creating user:", err);
    res.status(400).json({ error: err.message || "Could not create user" }); // Send detailed error message
  }
});

// PUT - Update User (ensure unique username/email validation here too)
router.put("/:id", async (req, res) => {
  const { username,fullName, email, password, phoneNumber, role, status, faculty, year } = req.body;

  // Ensure username and email are unique
  const existingUser = await User.findOne({
    $and: [{ _id: { $ne: req.params.id } }, { $or: [{ username }, { email }] }]
  });
  if (existingUser) {
    return res.status(400).json({ error: "Username or email already exists" });
  }

  try {
    const updatedData = { ...req.body };

    // Hash password if it's provided for update
    if (password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      updatedData.password = hashedPassword;
    }

    const updated = await User.findByIdAndUpdate(req.params.id, updatedData, { new: true });
    res.status(200).json(updated);
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

// Search for students by partial userId (starts with)
router.get("/search", async (req, res) => {
  const { query } = req.query;
  console.log("Search Query:", query); // Check the incoming query
  try {
    const students = await User.find({
      role: "student",
      userId: { $regex: `^${query}`, $options: "i" }
    }).select("userId fullName");
    res.json(students);
  } catch (err) {
    console.error("Error searching for students:", err);
    res.status(500).json({ error: "Error searching students" });
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
