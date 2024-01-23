const express = require("express");
const ClassSchedule = require("../models/ClassSchedule");
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    let { page = 1, limit = 10 } = req.query;
    let populateQuery = [
      { path: "students", select: "name" },
      { path: "instructor", select: "name" },
    ];
    let [schedlist, total] = await Promise.all([
      ClassSchedule.find({ dis: true })
        .limit(limit)
        .skip(limit * (page - 1))
        .populate(populateQuery),
      ClassSchedule.find({ dis: true }).count(),
    ]);

    res.json({ data: schedlist, total: total, message: "success get", success: true });
  } catch (err) {
    res.json({ data: null, message: err.message, success: false });
  }
});

/** get class schedule by id */
router.get("/getbyid/:id", async (req, res) => {
  try {
    let id = req.params.id;

    let populateQuery = [{ path: "instructor", select: "name" }];
    let class_schedule = await ClassSchedule.findOne({ _id: id }).populate(populateQuery);

    res.json({ data: class_schedule, message: "success by id", success: true });
  } catch (err) {
    res.json({ data: null, message: err.message, success: false });
  }
});

router.post("/", async (req, res) => {
  try {
    let data = req.body;
    await ClassSchedule.create(data);
    res.json({ data: null, message: "success register", success: true });
  } catch (err) {
    res.json({ data: null, message: err.message, success: false });
  }
});

router.patch("/:id", async (req, res) => {
  try {
    res.json({ data: null, message: "success patch", success: true });
  } catch (err) {
    res.json({ data: null, message: err.message, success: false });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    let id = req.params.id;
    await ClassSchedule.findByIdAndUpdate(id, { dis: false });

    res.json({ data: null, message: "success delete", success: true });
  } catch (err) {
    res.json({ data: null, message: err.message, success: false });
  }
});

module.exports = router;
