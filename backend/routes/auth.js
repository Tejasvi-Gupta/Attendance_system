const router = require("express").Router();
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role, studentId } = req.body;
    console.log("Register attempt:", { name, email, role });

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: "Email already exists" });

    const user = new User({ name, email, password, role, studentId });
    await user.save();

    console.log("User saved successfully:", user._id);

    res.status(201).json({
      token: signToken(user._id),
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error("REGISTER ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("Login attempt:", email);

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ message: "Invalid credentials" });

    console.log("Login successful:", user._id);

    res.json({
      token: signToken(user._id),
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;