const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const authRoutes = require("./routes/auth");
const attendanceRoutes = require("./routes/attendance");
const userRoutes = require("./routes/users");


const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// 🔗 Mount Auth Routes
app.use("/api/auth", authRoutes); 

// 🔗 Mount User Routes
app.use("/api/users", userRoutes);

// 🔗 Mount Attendance Routes
app.use("/api/attendance", attendanceRoutes);


app.get("/", (req, res) => {
  res.send("RFID Server Running 🚀");
});

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(process.env.PORT || 5000, () => {
      console.log(`Server started on port ${process.env.PORT || 5000}`);
    });
  })
  .catch((err) => console.error("MongoDB connection error:", err));

