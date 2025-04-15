const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email:    { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phoneNumber: { type: String, required: true }, // Add this field

   // Merchant fields
   merchantID: { type: String, unique: true, sparse: true }, // Only applies to merchants
   merchantName: { type: String }, // Only applies to merchants
   merchantType: { type: String }, // Only applies to merchants
  
  role: {
    type: String,
    enum: ['student', 'parent', 'admin', 'teacher', 'merchant'],
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

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next(); // Only hash if password is changed
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Verify password
UserSchema.methods.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model("User", UserSchema);
