const express = require("express");
const mongoose = require("mongoose");
const Equipment = require("../models/Equipment");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    let { page = 1, limit = 10 } = req.query;
    let populateQuery = [{ path: "type", select: "name" }];
    let [equipments, total] = await Promise.all([
      Equipment.find({ dis: true })
        .limit(limit)
        .skip(limit * (page - 1))
        .populate(populateQuery),
      Equipment.find({ dis: true }).count(),
    ]);
    res.json({
      data: equipments,
      total: total,
      message: "success get",
      success: true,
    });
  } catch (err) {
    res.json({ data: null, message: err.message, success: false });
  }
});

router.post("/", async (req, res) => {
  try {
    let data = req.body;
    await Equipment.create(data);
    res.json({
      data: null,
      message: "success create",
      success: true,
    });
  } catch (err) {
    res.json({ data: null, message: err.message, success: false });
  }
});

router.patch("/:id", async (req, res) => {
  try {
    res.json({
      data: less,
      message: "success update equipment",
      success: true,
    });
  } catch (err) {
    res.json({ data: null, message: err.message, success: false });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    let id = req.params.id;
    await Equipment.findByIdAndUpdate(id, { dis: false });
    res.json({ data: null, message: "success remove", success: true });
  } catch (err) {
    res.json({ data: null, message: err.message, success: false });
  }
});

/**
 * free search query search using $regex in "like" expression
 */
router.get("/search", async (req, res) => {
  try {
    let searchword = req.query.search;
    let equipments = await Equipment.find({
      $or: [{ name: { $regex: searchword, $options: "i" } }, { description: { $regex: searchword, $options: "i" } }],
    });
    res.json({ data: equipments, message: "success search", success: true });
  } catch (err) {
    res.json({ data: null, message: err.message, success: false });
  }
});

module.exports = router;
