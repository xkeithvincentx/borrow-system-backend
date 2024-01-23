const mongoose = require("mongoose");

const studentSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  dis: {
    type: Boolean,
  },
});

module.exports = mongoose.model("student", studentSchema);
