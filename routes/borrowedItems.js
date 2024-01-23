const express = require("express");
const router = express.Router();
const BorrowedItems = require("../models/BorrowedItems");

router.get("/", async (req, res) => {
  try {
    let page = req.query.page;
    let limit = req.query.limit;

    let populateQuery = [
      { path: "borrower", select: "name" },
      {
        path: "itemborrowed.equipment",
        select: "name",
        populate: { path: "type", select: "name" },
      },
    ];

    let [borrowedItems, total] = await Promise.all([
      BorrowedItems.find({ dis: true })
        .populate(populateQuery)
        .limit(limit)
        .skip(limit * (page - 1)),
      BorrowedItems.count(),
    ]);

    res.json({
      data: borrowedItems,
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
    await BorrowedItems.create(data);

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
    await BorrowedItems.findByIdAndUpdate(id, { dis: false });
    res.json({ data: null, message: "success remove", success: true });
  } catch (err) {
    res.json({ data: null, message: err.message, success: false });
  }
});

module.exports = router;
