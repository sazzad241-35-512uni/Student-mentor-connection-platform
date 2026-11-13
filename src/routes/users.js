const router = require("express").Router();
const User = require("../models/User");
const { requireAuth } = require("../middleware/auth");

const safeUser = (user) => ({
  id: user._id, name: user.name, role: user.role, field: user.field,
  bio: user.bio, skills: user.skills, createdAt: user.createdAt
});

router.get("/students", async (req, res, next) => {
  try { const filter = { role: 'student' }; if (req.query.search) { const q=String(req.query.search).replace(/[.*+?^${}()|[\]\\]/g,'\\$&'); filter.$or=[{name:new RegExp(q,'i')},{field:new RegExp(q,'i')},{skills:new RegExp(q,'i')}]; } const users=await User.find(filter).sort({createdAt:-1}).limit(100); res.json({students:users.map(safeUser)}); } catch(error){next(error)}
});

router.get("/mentors", async (req, res, next) => {
  try {
    const filter = { role: "mentor" };
    if (req.query.field) filter.field = new RegExp(String(req.query.field).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    if (req.query.search) {
      const escaped = String(req.query.search).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.$or = [{ name: new RegExp(escaped, "i") }, { field: new RegExp(escaped, "i") }, { skills: new RegExp(escaped, "i") }];
    }
    const users = await User.find(filter).sort({ createdAt: -1 }).limit(100);
    res.json({ mentors: users.map(safeUser) });
  } catch (error) { next(error); }
});

router.get("/me", requireAuth, (req, res) => res.json({ user: safeUser(req.user) }));

router.patch("/me", requireAuth, async (req, res, next) => {
  try {
    const allowed = ["name", "field", "bio", "skills"];
    for (const key of allowed) {
      if (req.body[key] !== undefined) req.user[key] = req.body[key];
    }
    await req.user.save();
    res.json({ user: safeUser(req.user) });
  } catch (error) { next(error); }
});

router.get("/:id", async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found." });
    res.json({ user: safeUser(user) });
  } catch (error) { next(error); }
});

module.exports = router;
