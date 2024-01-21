const mongoose = require("mongoose");

const EquipmentSchema = mongoose.Schema({
  serialNo: {
    type: String,
  },
  name: {
    type: String,
    required: true,
  },
  condition: {
    type: String,
    required: true,
    dafault: "good",
  },
});

module.exports = mongoose.model('equipments', EquipmentSchema)
