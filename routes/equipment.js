const express = require("express");
const mongoose = require("mongoose");
const Equipment = require("../models/Equipment");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    let { page = 1, limit = 10 } = req.query;
    let equipmenttype = req.query.equipmenttype;
    let brand = req.query.brand;
    let matter = req.query.matter;
    let description = req.query.description;
    let dateacquired = req.query.dateAcquired;
    let remarks = req.query.remarks;
    let department = req.query.department;
    let populateQuery = [{ path: "type", select: "name" }];
    let query = { dis: true };

    if (equipmenttype) query.equipmenttype = equipmenttype;
    if (brand) query.brand = { $regex: brand, $options: "i" };
    if (matter) query.matter = matter;
    if (description) query.description = { $regex: description, $options: "i" };
    if (dateacquired) query.dateAcquired = dateacquired;
    if (remarks) query.remarks = remarks;
    if (department) query.department = department;

    let [equipments, total] = await Promise.all([
      Equipment.find(query)
        .limit(limit)
        .skip(limit * (page - 1)),
      Equipment.find(query).count(),
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

router.get("/getbrandlist", async (req, res) => {
  try {
    let { page = 1, limit = 10 } = req.query;

    let [brandlist, total] = await Promise.all([
      Equipment.find({ dis: true }, { brand: 1 })
      .limit(limit)
      .skip(limit * (page - 1)),
      Equipment.find({ dis: true }).count(),
    ]);

    res.json({ data: brandlist, total: total, message: "success get", success: true });
  } catch (err) {
    res.json({ data: null, message: err.message, success: false });
  }
});

router.get("/getbynameasc", async (req, res) => {
  try {
    let { page = 1, limit = 10 } = req.query;

    let[ascedingnamelist, total] = await Promise.all([
      Equipment.find({ dis: true }, {name: 1})
      .sort({ name: 1})
      .limit(limit)
      .skip(limit * (page - 1)),
      Equipment.find({ dis: true }).count(),
    ]);

    res.json({ data: ascedingnamelist, total: total, message: "success get", success: true });
  } catch (err) {
      res.json({ data: null, message: err.message, success: false });
  }
});

router.get("/getbynamedesc", async (req, res) => {
  try {
    let { page = 1, limit = 10 } = req.query;

    let[descendingnamelist, total] = await Promise.all([
      Equipment.find({ dis: true }, {name: 1})
      .sort({ name: -1})
      .limit(limit)
      .skip(limit * (page - 1)),
      Equipment.find({ dis: true }).count(),
    ]);

    res.json({ data: descendingnamelist, total: total, message: "success get", success: true });
  } catch (err) {
      res.json({ data: null, message: err.message, success: false });
  }
});

router.get("/getbycolorasc", async (req, res) => {
  try {
    let { page = 1, limit = 10 } = req.query;

    let[ascendingcolorlist, total] = await Promise.all([
      Equipment.find({ dis: true }, {color: 1})
      .sort({ color: 1 })
      .limit(limit)
      .skip(limit * (page - 1)),
      Equipment.find({ dis: true }).count(),
    ]);

    res.json({ data: ascendingcolorlist, total: total, message: "success get", success: true });
  } catch (err) {
      res.json({ data: null, message: err.message, success: false });
  }
});

router.get("/getbycolordesc", async (req, res) => {
  try {
    let { page = 1, limit = 10 } = req.query;

    let[descendingcolorlist, total] = await Promise.all([
      Equipment.find({ dis: true }, {color: 1})
      .sort({ color: -1 })
      .limit(limit)
      .skip(limit * (page - 1)),
      Equipment.find({ dis: true }).count(),
    ]);

    res.json({ data: descendingcolorlist, total: total, message: "success get", success: true });
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
