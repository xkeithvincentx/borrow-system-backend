const fast_csv = require("fast-csv");
const fs = require("fs");
const equipmenttypes = require("./equipmenttypes.json");
const Equipment = require("../models/Equipment");
const EquipmentType = require("../models/EquipmentTypes");
const mongoose = require("mongoose");

const equipmentcondition = require("./equipmentcondition.json");

//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
(async () => {
  await connectDB();
  const stream = fs.createReadStream("./ECL-2-INVENTORY-JUNE-2023-1.xlsx - ECL 2.csv");
  const data = await csvRead(stream);
  for (let equipment of data) {
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
  let noserial = ["No sticker, No Serial Number", "No Serial Number", ""]

  let serial = "";
  noserial.forEach(value => {
    serial = data["Serial #"].includes(value) ? "N/A" : data['Serial #'];
  })

  //A = Active, R = Repair, O = Obselete

  let readstatus =  [data["Status A"], data["Status R"], data["Status O"]];
  let loopVar = 0;
  let stat = "";
  readstatus.forEach(value => {
    if(value.includes("√"))
    {
      if(loopVar == 0)
      {
        stat = "Active";
      }    
      else if(loopVar == 1)
      {
        stat = "Repair";
      }
      else
      {
        stat = "Obselete";
      }
    }
    loopVar++;
  });


  let cond = getEquipmentConditionByKeyword(data["Remarks/Action Taken"]);
  console.log("Remark : "+ cond);
  


  let equipmenttype = await getEquiptmentType(equipmenttypename);

  console.log("Equipment Description "+ (equipmenttype.name).toString());

  let non_inventory = ["Furniture", "Electrical Component", "Cleaning Equipment"];
  let descriptionType = "Inventory";

  if (!equipmenttype || !equipmenttypename.length) {
    console.log("no equipment type found ", equipmenttype, equipmenttypename, data["Description"]);
    return;
  }

  non_inventory.forEach(value => {
    descriptionType = (equipmenttype.name).toString() === value ? "Non-Inventory" : "Inventory";
  });

  let unit = data["Unit"] === '' ? "Set/Computer" : data["Unit"];

  let equipment = {
    serialNo: serial,
    equipmentType: equipmenttype.name,
    name: data["Description"],
    brand: data["Brand"],
    color: "",
    modelNo: data["Model"],
    quantity: parseInt(data["Quantity"]) ? parseInt(data["Quantity"]) : 1,
    unit: unit,
    // matter: "",
    description: descriptionType,
    status: stat,
    imagePath: data["Photo (Google Drive Link)"],
    remarks: cond,
    tags: true,
    checkedBy: data["Checked by"],
    department: "ECL",
  };

  try {
    let result = await Equipment.create(equipment);
    console.log("new equipment created with id:", result._id);
  } catch (err) {
    console.log(err);
  }
}

async function getEquiptmentType(equipmentTypeName) {
  return await EquipmentType.findOne({ name: { $regex: equipmentTypeName, $options: "i" } });
}

function getEquipmentTypeByKeword(description) {
  let equipmenttype = equipmenttypes.filter((equiptypes) => 
  equiptypes.keyword.some((keyword) => description.includes(keyword)));
  return equipmenttype[0]?.type ? equipmenttype[0]?.type : "";
}

function getEquipmentConditionByKeyword(description) {
  let condition = equipmentcondition.filter((con) => 
  con.keyword.some((keyword) => description.includes(keyword)));
  return condition[0]?.type ? condition[0]?.type : "Defective";
}


async function csvRead(stream) {
  return new Promise((resolve) => {
    let data = [];
    const options = { headers: true };

    fast_csv
      .parseStream(stream, options)
      .on("data", (row) => {
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


function titleCase(str) {
  return str
    .toLowerCase()
    .replace(/\b\w/g, (s) => s.toUpperCase())
    .trim();
}