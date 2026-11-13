const router = require("express").Router();
const Resource = require("../models/Resource");
const { requireAuth } = require("../middleware/auth");

router.get("/", async (_req, res, next) => {
  try {
    const resources = await Resource.find().populate("createdBy", "name").sort({ createdAt: -1 }).limit(100);
    res.json({ resources });
  } catch (error) { next(error); }
});

router.post("/", requireAuth, async (req, res, next) => {
  try {
    const { title, description = "", url } = req.body;
    if (!title || !url) return res.status(400).json({ message: "Title and URL are required." });
    let parsed;
    try { parsed = new URL(url); } catch { return res.status(400).json({ message: "Enter a valid URL." }); }
    if (!["http:", "https:"].includes(parsed.protocol)) return res.status(400).json({ message: "Only HTTP and HTTPS links are allowed." });
    const resource = await Resource.create({ title, description, url: parsed.toString(), createdBy: req.user._id });
    res.status(201).json({ resource });
  } catch (error) { next(error); }
});

router.delete("/:id", requireAuth, async (req, res, next) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) return res.status(404).json({ message: "Resource not found." });
    if (!resource.createdBy.equals(req.user._id) && req.user.role !== "admin") return res.status(403).json({ message: "Not permitted." });
    await resource.deleteOne();
    res.json({ message: "Resource deleted." });
  } catch (error) { next(error); }
});

module.exports = router;
