const fast_csv = require("fast-csv");
const fs = require("fs");
const equipmenttypes = require("./equipmenttypes.json");
const Equipment = require("../models/Equipment");
const EquipmentType = require("../models/EquipmentTypes");
const mongoose = require("mongoose");

//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
(async () => {
  await connectDB();
  const stream = fs.createReadStream("./ECL-2-INVENTORY-JUNE-2023-1.xlsx - ECL 2.csv");
  const data = await csvRead(stream);
  // console.log(data);
  // console.log(console.log(data[0]));
  for (let equipment of data) {
    // const stream1 = 

        

    await createEquipment(equipment);
  }
})();

async function connectDB() {
  try {
    mongoose.set("strictQuery", true);
    await mongoose.connect("mongodb://127.0.0.1:27017/borrowsystem");
    console.log("database connected");
  } catch (err) {
    console.log(err);
  }
}

async function createEquipment(data) {
  let equipmenttypename = getEquipmentTypeByKeword(data["Description"]);
  let equipmenttype = await getEquiptmentType(equipmenttypename);

//   if (!equipmenttype || !equipmenttypename.length) {
//     console.log("no equipment type found ", equipmenttype, equipmenttypename, data["Description"]);
//     return;
//   }
  let equipment = {
    // serialNo: data["Serial #"],
    // equipmentType: equipmenttype._id,
    // name: data["Description"],
    brand: data["Brand"],
    // color: "",
    // modelNo: data["Model"],
    // quantity: parseInt(data["Quantity"]) ? parseInt(data["Quantity"]) : 1,
    // unit: data["Unit"],
    // matter: "",
    // description: data["Description"],
    // status: "",
    // imagePath: data["Photo (Google Drive Link)"],
    // remarks: data["Remarks/Action Taken"],
    // tags: true,
    // checkedBy: data["Checked by"],
    // department: "",
  };

  console.log({ equipment });

//   try {
//     let result = await Equipment.create(equipment);
//     console.log("new brand created with id:", result._id);
//   } catch (err) {
//     console.log(err);
//   }
}

async function getEquiptmentType(equipmentTypeName) {
  return await EquipmentType.findOne({ name: { $regex: equipmentTypeName, $options: "i" } });
}

function getEquipmentTypeByKeword(description) {
  let equipmenttype = equipmenttypes.filter((equiptypes) => equiptypes.keyword.some((keyword) => description.includes(keyword)));
  return equipmenttype[0]?.type ? equipmenttype[0]?.type : "";
}

async function csvRead(stream) {
  return new Promise((resolve) => {
    let data = [];
    const options = { headers: true };

    fast_csv
      .parseStream(stream, options)
      .on("data", (row) => {
        // console.log({ row });
        data.push(row);
      })
      .on("end", () => {
        resolve(data);
      })
      .on("error", function (err) {
        console.log({ err });
      });
  });
}
