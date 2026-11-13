
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 80
  },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },

  passwordHash: {
    type: String,
    required: true,
    select: false
  },

  role: {
    type: String,
    enum: ["student", "mentor", "admin"],
    default: "student"
  },

  field: {
    type: String,
    trim: true,
    maxlength: 100,
    default: ""
  },

  // New profile fields
  profilePicture: {
    type: String,
    default: ""
  },

  university: {
    type: String,
    trim: true,
    maxlength: 150,
    default: ""
  },

  department: {
    type: String,
    trim: true,
    maxlength: 150,
    default: ""
  },

  bio: {
    type: String,
    trim: true,
    maxlength: 600,
    default: ""
  },

  skills: [{
    type: String,
    trim: true,
    maxlength: 50
  }],

  researchInterests: [{
    type: String,
    trim: true,
    maxlength: 100
  }],

  isActive: {
    type: Boolean,
    default: true
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("User", userSchema);