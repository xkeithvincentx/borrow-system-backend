const express = require("express");
const router = express.Router();
const Equipment = require("./../models/Equipment");

router.get("/", async (req, res) => {
  res.send({
    data: [
      { itemNo: "001", itemName: "Longnose" },
      { itemNo: "002", itemName: "Pliers" },
    ],
  });
});

router.get("/findById", async (req, res) => {
  let id = req.query.itemNo;
  let data = [
    { itemNo: "001", itemName: "Longnose" },
    { itemNo: "002", itemName: "Pliers" },
  ];

  let result = data.filter((x) => x.itemNo == id);

  res.send({ data: result });
});

router.post("/", async (req, res) => {
  let data = req.body;
  console.log(data);
  await Equipment.create(data);
  res.send({ message: "Equipment created successfully" });
});

module.exports = router;
