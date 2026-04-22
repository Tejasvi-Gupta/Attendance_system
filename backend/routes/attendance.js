const router = require("express").Router();
const Attendance = require("../models/Attendance");
const { protect, adminOnly } = require("../middleware/auth");

// Mark single attendance
router.post("/mark", protect, adminOnly, async (req, res) => {
  try {
    const { studentId, date, subject, status } = req.body;
    const record = await Attendance.findOneAndUpdate(
      { student: studentId, date, subject },
      { status, markedBy: req.user._id },
      { upsert: true, new: true }
    );
    res.status(201).json(record);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Bulk mark attendance
router.post("/bulk", protect, adminOnly, async (req, res) => {
  try {
    const { records, date, subject } = req.body;
    const ops = records.map(({ studentId, status }) => ({
      updateOne: {
        filter: { student: studentId, date, subject },
        update: { $set: { status, markedBy: req.user._id } },
        upsert: true,
      },
    }));
    await Attendance.bulkWrite(ops);
    res.json({ message: "Bulk attendance marked" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE a single student's record
router.delete("/remove", protect, adminOnly, async (req, res) => {
  try {
    const { studentId, date, subject } = req.body;
    console.log("Deleting attendance:", { studentId, date, subject });
    const result = await Attendance.findOneAndDelete({
      student: studentId,
      date,
      subject,
    });
    console.log("Delete result:", result ? "deleted" : "not found");
    res.json({ message: "Attendance record removed", deleted: !!result });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ message: err.message });
  }
});

// Get attendance by date + subject (admin)
router.get("/class", protect, adminOnly, async (req, res) => {
  try {
    const { date, subject } = req.query;
    const records = await Attendance.find({ date, subject }).populate(
      "student", "name email studentId"
    );
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get attendance by student
router.get("/student/:id", protect, async (req, res) => {
  try {
    const records = await Attendance.find({ student: req.params.id }).sort({ date: -1 });
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get stats for a student
router.get("/stats/:id", protect, async (req, res) => {
  try {
    const stats = await Attendance.aggregate([
      {
        $match: {
          student: require("mongoose").Types.ObjectId.createFromHexString(req.params.id),
        },
      },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);
    res.json(stats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;