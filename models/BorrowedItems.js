const mongoose = require("mongoose");

const itemSchema = mongoose.Schema({
  equipment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "equipment",
  },
  quantity: {
    type: Number,
    required: true,
  },
  condition: {
    type: String,
    default: "good",
  },
  status: {
    type: String,
    default: "borrowed",
  },
});

const borrowedItemsSchema = mongoose.Schema({
  itemborrowed: {
    type: [itemSchema],
    default: [],
    // default: () => {return null;},
  },
  dateborrowed: {
    type: Date,
    required: true,
    default: Date.now,
  },
  borrower: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "student",
  },
  dis: {
    type: Boolean,
    default: true
  }
});

module.exports = mongoose.model("borrowed_items", borrowedItemsSchema);
