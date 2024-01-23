const mongoose = require("mongoose");

const EquipmentSchema = mongoose.Schema({
  serialNo: {
    type: String,
  },
  name: {
    type: String,
  },
  modelNo: {
    type: String,
  },
  description: {
    type: String,
  },
  brand: {
    type: String,
  },
  type: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'equipmentType',
    required: true
  },
  condition: {
    type: String,
    required: true,
    default: "good"
  },
  dateAcquired: {
    type: Date,
    required: true,
    default: Date.now
  },
  dis: {
    type: Boolean,
    default: true
  }
});

module.exports = mongoose.model('equipment', EquipmentSchema);
