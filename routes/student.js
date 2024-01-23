const express = require("express");
const Student = require("../models/Student");
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    res.json({ success: true });
  } catch (err) {
    res.json({ success: false });
  }
});

router.post("/", async (req, res) => {
  try {
    let data = req.body;
    await Student.create(data);
    res.json({ message: "success register", success: true });
  } catch (err) {
    res.json({ message: err.message, success: false });
  }
});

router.patch("/:id", async (req, res) => {
  try {
    res.json({ success: true });
  } catch (err) {
    res.json({ success: false });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    let id = req.params.id;
    await Student.updateOne(
      { _id: id },
      {
        $set: {
          dis: false,
        },
      }
    );
    res.json({ success: true });
  } catch (err) {
    res.json({ success: false });
  }
});

module.exports = router;
