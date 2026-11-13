const router = require("express").Router();
const Event = require("../models/Event");
const { requireAuth } = require("../middleware/auth");

router.get("/", async (_req, res, next) => {
  try {
    const events = await Event.find().populate("createdBy", "name").sort({ startsAt: 1 }).limit(100);
    res.json({ events });
  } catch (error) { next(error); }
});

router.post("/", requireAuth, async (req, res, next) => {
  try {
    const { title, description = "", startsAt, location = "Online" } = req.body;
    if (!title || !startsAt || Number.isNaN(Date.parse(startsAt))) {
      return res.status(400).json({ message: "A title and valid start date are required." });
    }
    const event = await Event.create({ title, description, startsAt: new Date(startsAt), location, createdBy: req.user._id });
    res.status(201).json({ event });
  } catch (error) { next(error); }
});

router.post("/:id/interested", requireAuth, async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found." });
    const alreadyInterested = event.interestedUsers.some((id) => id.equals(req.user._id));
    if (alreadyInterested) event.interestedUsers.pull(req.user._id);
    else event.interestedUsers.addToSet(req.user._id);
    await event.save();
    res.json({ interested: !alreadyInterested, interestedCount: event.interestedUsers.length });
  } catch (error) { next(error); }
});

router.delete("/:id", requireAuth, async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found." });
    if (!event.createdBy.equals(req.user._id) && req.user.role !== "admin") return res.status(403).json({ message: "Not permitted." });
    await event.deleteOne();
    res.json({ message: "Event deleted." });
  } catch (error) { next(error); }
});

module.exports = router;
