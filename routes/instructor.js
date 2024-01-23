const express = require("express");
const Instructor = require("./../models/Instructor");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    let { page = 1, limit = 10 } = req.query;
    let [instructors, total] = await Promise.all([
      Instructor.find({ dis: true })
        .limit(limit)
        .skip(limit * (page - 1)),
      Instructor.find({ dis: true }).count(),
    ]);
    res.json({ data: instructors, total: total, messge: "success get", success: true });
  } catch (err) {
    res.json({ data: null, message: err.message, success: false });
  }
});

router.post("/", async (req, res) => {
  try {
    let data = req.body;
    await Instructor.create(data);
    res.json({ data: null, message: "register success", success: true });
  } catch (err) {
    res.json({ data: null, message: err.message, success: false });
  }
});

router.patch("/:id", async (req, res) => {
  try {
    res.json({ data: null, message: "update success", success: true });
  } catch (err) {
    res.json({ data: null, message: err.message, success: false });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    let id = req.params.id;
    await Instructor.findByIdAndUpdate(id, { dis: false });
    res.json({ data: null, message: "delete success", success: true });
  } catch (err) {
    res.json({ data: null, message: err.message, success: false });
  }
});
module.exports = router;
