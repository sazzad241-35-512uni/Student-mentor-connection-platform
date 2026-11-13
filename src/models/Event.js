const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 160 },
  description: { type: String, trim: true, maxlength: 1000, default: "" },
  startsAt: { type: Date, required: true },
  location: { type: String, trim: true, maxlength: 160, default: "Online" },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  interestedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]
}, { timestamps: true });

module.exports = mongoose.model("Event", eventSchema);
