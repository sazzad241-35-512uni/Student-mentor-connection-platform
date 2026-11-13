const router = require("express").Router();
const mongoose = require("mongoose");
const Message = require("../models/Message");
const User = require("../models/User");
const Notification = require("../models/Notification");
const { requireAuth } = require("../middleware/auth");

router.get("/", requireAuth, async (req, res, next) => { try { const rows = await Message.aggregate([{ $match: { $or: [{ sender: req.user._id }, { recipient: req.user._id }] } }, { $sort: { createdAt: -1 } }, { $group: { _id: { $cond: [{ $eq: ["$sender", req.user._id] }, "$recipient", "$sender"] }, lastMessage: { $first: "$text" }, lastAt: { $first: "$createdAt" }, unread: { $sum: { $cond: [{ $and: [{ $eq: ["$recipient", req.user._id] }, { $eq: ["$readAt", null] }] }, 1, 0] } } } }]); const ids = rows.map(r => r._id); const users = await User.find({ _id: { $in: ids } }).select("name role field"); res.json({ conversations: rows.map(r => ({ user: users.find(u => String(u._id) === String(r._id)), lastMessage: r.lastMessage, lastAt: r.lastAt, unread: r.unread })) }); } catch(e) { next(e); } });

router.get("/:userId", requireAuth, async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.userId)) return res.status(400).json({ message: "Invalid user ID." });
    const otherUser = await User.findById(req.params.userId);
    if (!otherUser) return res.status(404).json({ message: "Conversation user not found." });
    await Message.updateMany({ sender: otherUser._id, recipient: req.user._id, readAt: null }, { $set: { readAt: new Date() } });
    const messages = await Message.find({
      $or: [
        { sender: req.user._id, recipient: otherUser._id },
        { sender: otherUser._id, recipient: req.user._id }
      ]
    }).sort({ createdAt: 1 }).limit(300).populate("sender recipient", "name role");
    res.json({ messages });
  } catch (error) { next(error); }
});

router.post("/", requireAuth, async (req, res, next) => {
  try {
    const { recipientId } = req.body;
    const text = String(req.body.text || "").trim();
    if (!mongoose.isValidObjectId(recipientId)) return res.status(400).json({ message: "Valid recipientId is required." });
    if (!text) return res.status(400).json({ message: "Message text is required." });
    if (String(req.user._id) === String(recipientId)) return res.status(400).json({ message: "You cannot message yourself." });
    const recipient = await User.findById(recipientId);
    if (!recipient) return res.status(404).json({ message: "Recipient not found." });
    const message = await Message.create({ sender: req.user._id, recipient: recipient._id, text });
    await message.populate("sender recipient", "name role");
    const io = req.app.get("io"); if (io) io.to(`user:${String(recipient._id)}`).emit("new-message", { message });
    await Notification.create({ user: recipient._id, actor: req.user._id, type: "message", text: `${req.user.name} sent you a message.`, link: "messages" });
    res.status(201).json({ message });
  } catch (error) { next(error); }
});

module.exports = router;
