
const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

const User = require("../models/User");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

const uploadDir = path.join(__dirname, "../../public/uploads");
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${crypto.randomUUID()}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp"];

    if (!allowed.includes(file.mimetype)) {
      return cb(new Error("Use a JPG, PNG, or WebP image."));
    }

    cb(null, true);
  }
});

// GET the authenticated user's profile
router.get("/me", requireAuth, async (req, res) => {
  try {
    res.json({ user: req.user });
  } catch (_error) {
    res.status(500).json({ message: "Could not load profile." });
  }
});

// UPDATE the authenticated user's profile
router.put(
  "/me",
  requireAuth,
  upload.single("profilePicture"),
  async (req, res) => {
    try {
      const updates = {};

      const textFields = [
        "name",
        "bio",
        "university",
        "department",
        "field"
      ];

      for (const field of textFields) {
        if (typeof req.body[field] === "string") {
          updates[field] = req.body[field].trim();
        }
      }

      if (updates.name !== undefined && updates.name.length < 2) {
        return res.status(400).json({
          message: "Name must contain at least 2 characters."
        });
      }

      if (updates.bio && updates.bio.length > 600) {
        return res.status(400).json({
          message: "Bio must be 600 characters or fewer."
        });
      }

      for (const field of ["skills", "researchInterests"]) {
        if (req.body[field] !== undefined) {
          try {
            const values = JSON.parse(req.body[field]);

            if (
              !Array.isArray(values) ||
              !values.every(value => typeof value === "string")
            ) {
              return res.status(400).json({
                message: `${field} must be a list of strings.`
              });
            }

            updates[field] = values
              .map(value => value.trim())
              .filter(Boolean);
          } catch {
            return res.status(400).json({
              message: `Invalid ${field} format.`
            });
          }
        }
      }

      if (req.file) {
        updates.profilePicture = `/uploads/${req.file.filename}`;
      }

      // req.user comes from requireAuth; never accept a user ID
      // from the request body to choose whose profile to update.
      const user = await User.findByIdAndUpdate(
        req.user._id,
        { $set: updates },
        {
          new: true,
          runValidators: true
        }
      );

      if (!user) {
        return res.status(404).json({ message: "User not found." });
      }

      res.json({
        message: "Profile updated successfully.",
        user
      });
    } catch (error) {
      console.error("Profile update error:", error.message);

      res.status(500).json({
        message: "Could not update profile."
      });
    }
  }
);

// Return a small list of real, active student and mentor profiles.
router.get("/suggestions", requireAuth, async (req, res) => {
  try {
    const users = await User.find({
      _id: { $ne: req.user._id },
      isActive: true,
      role: { $in: ["student", "mentor"] }
    })
      .select("name role field bio skills profilePicture university")
      .limit(6)
      .sort({ createdAt: -1 });

    res.json({ users });
  } catch (_error) {
    res.status(500).json({
      message: "Could not load profile suggestions."
    });
  }
});

module.exports = router;