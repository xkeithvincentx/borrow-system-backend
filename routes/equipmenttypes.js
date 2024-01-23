const express = require("express");
const mongoose = require("mongoose");
const EquipmentType = require("../models/EquipmentTypes");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    let { limit = 1, page = 1 } = req.query;

    let [equipmenttypes, total] = await Promise.all([
      EquipmentType.find()
        .limit(limit * 1)
        .skip((page - 1) * limit),
      EquipmentType.count(),
    ]);

    res.json({
      data: equipmenttypes,
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
    await EquipmentType.create(data);
    res.json({ data: null, message: "success register", success: true });
  } catch (err) {
    res.json({ data: null, message: err.message, success: false });
  }
});

router.patch("/:id", async (req, res) => {
  try {
    await res.json({ data: null, message: "success update", success: true });
  } catch (err) {
    res.json({ data: null, message: err.message, success: false });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    let id = req.params.id;
    await EquipmentType.findByIdAndUpdate(id, { dis: false });

    res.json({ data: result, message: "success delete", success: true });
  } catch (err) {
    res.json({ data: null, message: err.message, success: false });
  }
});

module.exports = router;
