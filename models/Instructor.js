const mongoose = require("mongoose");

const instructorSchema = mongoose.Schema({
  name: {
    type: String,
  },
  dis: {
    type: Boolean,
    default: true,
  },
});

module.exports = mongoose.model("instructor", instructorSchema);
