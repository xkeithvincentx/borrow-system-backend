const mongoose = require("mongoose");

const classScheduleSchema = mongoose.Schema({
  offercode: {
    type: String,
  },
  subjectcode: {
    type: String,
  },
  name: {
    type: String,
  },
  schedule: {
    type: String,
  },
  room: {
    type: String,
  },
  instructor: {
    type: mongoose.Types.ObjectId,
    ref: "instructor",
  },
  students: [
    {
      type: mongoose.Types.ObjectId,
      ref: "student",
    },
  ],
  dis: {
    type: Boolean,
    default: true,
  },
});

module.exports = mongoose.model("class_schedule", classScheduleSchema);
