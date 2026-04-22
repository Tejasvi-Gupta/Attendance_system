const router = require("express").Router();
const User = require("../models/User");
const { protect, adminOnly } = require("../middleware/auth");

// Get all students (admin)
router.get("/students", protect, adminOnly, async (req, res) => {
  try {
    const students = await User.find({ role: "student" }).select("-password");
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get own profile
router.get("/me", protect, async (req, res) => {
  res.json(req.user);
});

module.exports = router;