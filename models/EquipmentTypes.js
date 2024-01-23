const mongoose = require("mongoose");

const EquipmentTypeSchema = mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
  },
  dis: {
    type: Boolean,
    default: true
  }
});


module.exports = mongoose.model('equipmentType', EquipmentTypeSchema);
