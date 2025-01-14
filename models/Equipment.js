const mongoose = require("mongoose");

const EquipmentSchema = mongoose.Schema({
  serialNo: {
    type: String,
  },
  equipmentType: {
    type: mongoose.Schema.Types.ObjectId,
  },
  name: {
    type: String,
  },
  brand: {
    type: String,
  },
  color: {
    type: String,
  },
  modelNo: {
    type: String,
  },
  quantity: {
    type: Number,
  },
  unit: {
    type: String,
  },
  matter: {
    type: String,
  },
  description: {
    type: String,
  },
  status: {
    type: String,
  },
  dateAcquired: {
    type: Date,
    required: true,
    default: Date.now,
  },
  imagePath: [
    {
      type: String,
    },
  ],
  remarks: {
    type: String,
  },
  tags: {
    type: Boolean,
  },
  checkedBy: {
    type: String,
  },
  department: {
    type: Number,
  },
  dis: {
    type: Boolean,
    default: true,
  },
});

module.exports = mongoose.model("equipment", EquipmentSchema);
