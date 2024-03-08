const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const app = express();
require('dotenv').config();

/**
 * import routes
 */
const equipmentRoute = require("./routes/equipment");
const equipmenttypeRoute = require("./routes/equipmenttypes");
const borrowedItems = require("./routes/borrowedItems");
const class_schedule = require("./routes/classSchedule");
const students = require("./routes/student");
const instructor = require("./routes/instructor");

/**
 * middleware
 */
app.use(express.json());
app.use(cors());

/**
 * routes
 */
app.use("/api/equipment", equipmentRoute);
app.use("/api/equipmenttype", equipmenttypeRoute);
app.use("/api/borroweditems", borrowedItems);
app.use("/api/classschedule", class_schedule);
app.use("/api/student", students);
app.use("/api/instructor", instructor);

// mongoose.connect("mongodb://127.0.0.1:27017/borrowsystem");
try {
  mongoose.connect(process.env.DATABASE);
  // mongoose.connect("mongodb://127.0.0.1:27017/borrowsystem");
} catch(err) {
  console.log(err);
}


app.listen(3000, (err) => {
  if (err) console.log("error");
  else console.log("listening to port 3000");
});
