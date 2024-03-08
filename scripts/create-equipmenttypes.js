const equipmenttypes = require("./equipmenttypes.json");
const EquipmentType = require("../models/EquipmentTypes");
const mongoose = require("mongoose");
require('dotenv').config();


(async () => {
  await connectDB();
  /**
   * 1. Remove duplicate equipment types (just to double check to avoid duplicates)
   */
  const unique_equipmenttypes = equipmenttypes.filter(
    (equiptype, ndx, arr) =>
      ndx === arr.findIndex((item) => item.type === equiptype.type)
  );

  for (let equipmenttype of unique_equipmenttypes) {
    /**
     * 2. Check if Equipment Type already exist in DB
     */
    const result = await getEquipmentTypeByName(titleCase(equipmenttype.type));
    if (result) {
      console.log("equipment type already existed", result);
      continue;
    } else {
      /**
       * 3. Create Equipment Type in DB
       */
      let newEquipmentType = {
        name: equipmenttype.type,
        description: "",
      };
      await createEquipmentType(newEquipmentType);
    }
  }
})();

async function getEquipmentTypeByName(name) {
  let query = { name: name, dis: true };
  return await EquipmentType.findOne(query).select("name");
}

function titleCase(str) {
  return str
    .toLowerCase()
    .replace(/\b\w/g, (s) => s.toUpperCase())
    .trim();
}

async function createEquipmentType(data) {
  try {
    let result = await EquipmentType.create({
      name: titleCase(data.name),
      description: data.description,
    });
    console.log("new equipment type created with id:", result._id);
  } catch (err) {
    console.log(err);
  }
}

async function connectDB() {
  try {
    // mongoose.set("strictQuery", true);
    await mongoose.connect(process.env.DATABASE);
    console.log("database connected");
  } catch (err) {
    // console.log(err);
  }
}
