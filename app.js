const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const app = express();

/**
 * import routes
 */
const equipmentRoute = require("./routes/equipmentRoute");

/**
 * middleware
 */
app.use(express.json());
app.use(cors());

/**
 * routes
 */
app.use("/api/equipment", equipmentRoute);

mongoose.connect("mongodb://127.0.0.1:27017/borrowsystem");

app.listen(3000);
