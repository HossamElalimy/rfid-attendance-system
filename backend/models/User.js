const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email:    { type: String, required: true, unique: true },
  password: { type: String, required: true },
  
  role: {
    type: String,
    enum: ['student', 'parent', 'admin', 'teacher'],
    default: 'student'
  },

  status: {
    type: String,
    enum: ['active', 'blocked'],
    default: 'active'
  },

  userId: {
    type: String,
    unique: true,
    sparse: true
  },

  joined: {
    type: Date,
    default: Date.now
  }

}, { timestamps: true });

module.exports = mongoose.model("User", UserSchema);
