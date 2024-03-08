const fast_csv = require("fast-csv");
// const fs = require("fs");
const equipmenttypes = require("./equipmenttypes.json");
const Equipment = require("../models/Equipment");
const EquipmentType = require("../models/EquipmentTypes");
const mongoose = require("mongoose");
const express = require("express");
const path = require ("path");

const fs = require('fs');
const { google } = require('googleapis');
const apikeys = require('./apikey.json');
const sharp = require('sharp');

var URL = 'https://drive.google.com/uc?export=view&id=1M-tsjwX50b8njVj-G6ek-7wpHvruXWJb'; // Example URL
var name = '';
var department = '';
var departmentId = '';
var mainFolder = '';
var nameEquipment = '';

const SCOPE = ["https://www.googleapis.com/auth/drive"];

var directory = {
  Inventory: '16Hn6FnhtPplQaLiMXKPIqMWBjoY7l6T4',
  Non_Inventory: '1PN3cEnrDHW0LmVvAJEjNEMASBpdizTES',
}

const app = express();
app.use(express.static(path.join(__dirname, 'public')));

require('dotenv').config();

const equipmentcondition = require("./equipmentcondition.json");

//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
(async () => {
  await connectDB();
  const stream = fs.createReadStream("./ECL-INVENTORY-APRIL-2023-1.csv");
  const data = await csvRead(stream);
  for (let equipment of data) {
    await createEquipment(equipment);
  }
})();

async function connectDB() {
  try {
    mongoose.set("strictQuery", true);
    await mongoose.connect("mongodb://127.0.0.1:27017/borrowsystem");
    // await mongoose.connect(process.env.DATABASE);
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
  // console.log("Remark : "+ cond);
  
  let equipmenttype = await getEquiptmentType(equipmenttypename);
  // console.log("Sprinkles" + equipmenttype);

  // console.log("Equipment Description "+ (equipmenttype.name).toString());

  let non_inventory = ["Furniture", "Electrical Component", "Cleaning Equipment"];
  let descriptionType = "Inventory";

  if (!equipmenttype || !equipmenttypename.length) {
    // console.log("no equipment type found ", equipmenttype, equipmenttypename, data["Description"]);
    console.log("no equipment type found ", equipmenttypename, data["Description"]);
    return;
  }

  non_inventory.forEach(value => { 
    if(descriptionType === "Non-Inventory")
    {
      descriptionType = "Non-Inventory"
    }
    else
    {
      descriptionType = equipmenttype.name === value ? "Non-Inventory" : "Inventory";
    }
  });

  let unit = data["Unit"] === '' ? "Set/Computer" : data["Unit"];
  
  URL = data["Photo (Google Drive Link)"];
  department = 'ECL';

  if(URL.length > 0)
  {
    URL = data["Photo (Google Drive Link)"];
    nameEquipment = equipmenttype.name;

    if(descriptionType === "Inventory")
    {
      mainFolder = directory.Inventory;
    }
    else
    {
      mainFolder = directory.Non_Inventory;
    }

    await compressImage();
  }

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
    images: {
      thumbnailUrl: thumbnailUrl,
      midSizeUrl: midSizeUrl,
      Url: data["Photo (Google Drive Link)"],
    },
    // imagePath: data["Photo (Google Drive Link)"],
    remarks: cond,
    tags: true,
    checkedBy: data["Checked by"],
    department: department,
  };

  try {
    let result = await Equipment.create(equipment);
    // console.log("new equipment created with id:", result._id);
  } catch (err) {
    // console.log(err);
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
        // console.log({ err });
      });
  });
}

async function authorize() {
  const jwtClient = new google.auth.JWT(
    apikeys.client_email,
    null,
    apikeys.private_key,
    SCOPE
  );

  await jwtClient.authorize();
  return jwtClient
}

let toUpload = '';

async function uploadFile(authclient) {
  return new Promise((resolve, rejected) => {
    const drive = google.drive({ version: 'v3', auth: authclient });

    var newPermission = {
      role: 'reader',
      type: 'anyone',
      withLink: true,
    };

    drive.files.list({
      q: `'${mainFolder}' in parents and trashed=false`,
      fields: 'files(id, name)',
      pageSize: 1000,
      orderBy: 'folder'
    }, function(error, file) {

      
      createNewFolder(file, drive, function(err, id) {
        if (err) {
          console.error(err);
          return;
        }

        // console.log("Count " + file.data.files.length);
        departmentId = id;
        console.log(departmentId);

        var fileMetaData = {
          name: name,
          parents: [departmentId]
        }

        drive.files.create({
          resource: fileMetaData,
          media: {
            body: fs.createReadStream(toUpload),
            mimeType: 'image/jpeg',
          },
          fields: 'id, webViewLink',
        },
          function(error, file) {
            if (error) {
              return rejected(error)
            }

            drive.permissions.create({
              resource: newPermission,
              fileId: file.data.id,
              fields: 'id',
            });

            console.log(`File uploaded successfully: ${file.data.webViewLink}`);
            resolve(file.data.webViewLink);
          })
      });
    });

  });
}

async function createNewFolder(file, drive, callback) {
  const folder = file.data.files.find(value => value["name"] === department);
  if (folder) {
    // If a folder with a different name already exists, return its id
    return callback(null, file.data.files.find(value => value["name"] === department).id);
  }
  else {
    var folderMetaData = {
      name: department,
      mimeType: 'application/vnd.google-apps.folder',
      parents: [mainFolder]
    }
      await drive.files.create(
      {
        resource: folderMetaData,
        fields: 'id'
      }, function(err, file) {
        console.log(file.data.id);
        return callback(null, file.data.id);
      });
  }
}

let thumbnailUrl = '';
let midSizeUrl = '';

async function compressImage() {
  var temp = URL.split('/')[5];
  console.log(URL.split('/'));

  URL = "https://drive.google.com/uc?export=view&id=" + temp;
  console.log(URL);
  await fetch(URL)
    .then(response => tempData = response)
    .then(async data => {
      if (data.status === 404) {
        console.log("Error: File does not exist");
        thumbnailUrl  = '';
        midSizeUrl = '';
        mainFolder = '';
      } else {
        await convertImage();
        const timestamp = new Date(); // current timestamp
        const objectId = timestamp.getTime().toString();

        [thumbnailUrl, midSizeUrl] = await Promise.all([
          await thumbSizeUpload(objectId).then(value => { return value; }),
          await midSizeUpload(objectId).then(value => { return value; })
        ]);
        console.log("Thumbnail Url: " + thumbnailUrl);
        console.log("Midsize Url: " + midSizeUrl);
      }
    }
  );
}

// thumbSizeUpload().then(value => { return value; }),

async function thumbSizeUpload(id) {
  return new Promise(async (resolve, reject) => {
    toUpload = 'thumbnail.jpeg';
    name = 'thumbnail_' + nameEquipment + '_'+ id + '.jpeg';
    resolve(await authorize().then(uploadFile).then(webViewLink => webViewLink).catch("error", console.error()))
  });
}

async function midSizeUpload(id) {
  return new Promise(async (resolve, reject) => {
    toUpload = 'midsize.jpeg';
    name = 'midsize_' + nameEquipment + '_'+ id + '.jpeg';
    resolve(await authorize().then(uploadFile).then(webViewLink => webViewLink).catch("error", console.error()))
  });
}

async function convertImage() {
  return new Promise((resolve, reject) => {
    fetchImage()
      .then(thumbnailUrl => resolve(thumbnailUrl))
      .catch(err => reject(err));
  });
}

async function fetchImage() {
  return new Promise((resolve, reject) => {
    fetch(URL)
      .then(response => response.arrayBuffer())
      .then(buffer => {
        const image = Buffer.from(buffer).toString('base64');
        toThumbnail(resolve, reject, image);
        toMidSize(resolve, reject, image);
      });
  });
}

async function toThumbnail(resolve, reject, image) {
  await sharp(Buffer.from(image, 'base64'))
    .jpeg({ quality: 60 })
    .resize(150)
    .toFile("thumbnail.jpeg")
    .then(data => {
      const thumbnail = data.toString('base64');
      resolve(thumbnail);
    })
    .catch(err => reject(`Resize issue: ${err}`));
}

async function toMidSize(resolve, reject, image) {
  await sharp(Buffer.from(image, 'base64'))
    .jpeg({ quality: 40 })
    .resize(300)
    .toFile("midsize.jpeg")
    .then(data => {
      const thumbnail = data.toString('base64');
      resolve(thumbnail);
    })
    .catch(err => reject(`Resize issue: ${err}`));
}