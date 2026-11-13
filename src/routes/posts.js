const router = require("express").Router();
const Post = require("../models/Post");
const { requireAuth } = require("../middleware/auth");
const Notification = require("../models/Notification");

router.get("/", async (req, res, next) => {
  try {
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    const posts = await Post.find().populate("author", "name role field").sort({ createdAt: -1 })
      .skip((page - 1) * 20).limit(20);
    res.json({ posts: posts.map((post) => ({
      id: post._id, text: post.text, author: post.author,
      likesCount: post.likes.length, createdAt: post.createdAt
    })) });
  } catch (error) { next(error); }
});

router.post("/", requireAuth, async (req, res, next) => {
  try {
    const text = String(req.body.text || "").trim();
    if (!text) return res.status(400).json({ message: "Post text is required." });
    const post = await Post.create({ author: req.user._id, text });
    await post.populate("author", "name role field");
    res.status(201).json({ post });
  } catch (error) { next(error); }
});

router.post("/:id/like", requireAuth, async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found." });
    const alreadyLiked = post.likes.some((id) => id.equals(req.user._id));
    if (alreadyLiked) post.likes.pull(req.user._id);
    else post.likes.addToSet(req.user._id);
    await post.save();
    if (!alreadyLiked && !post.author.equals(req.user._id)) await Notification.create({ user: post.author, actor: req.user._id, type: "post_like", text: `${req.user.name} liked your post.`, link: "feed" });
    res.json({ liked: !alreadyLiked, likesCount: post.likes.length });
  } catch (error) { next(error); }
});

router.delete("/:id", requireAuth, async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found." });
    if (!post.author.equals(req.user._id) && req.user.role !== "admin") {
      return res.status(403).json({ message: "You can delete only your own posts." });
    }
    await post.deleteOne();
    res.json({ message: "Post deleted." });
  } catch (error) { next(error); }
});

module.exports = router;
