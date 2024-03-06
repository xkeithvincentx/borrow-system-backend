const fs = require('fs');
const { google } = require('googleapis');
const apikeys = require('./apikey.json');
const sharp = require('sharp');

let URL = 'https://drive.google.com/uc?export=view&id=1M-tsjwX50b8njVj-G6ek-7wpHvruXWJb'; // Example URL
let name = '';
let department = '';
let departmentId = '';
let mainFolder = '';
let nameEquipment = '';

const SCOPE = ["https://www.googleapis.com/auth/drive"];

let directory = {
  Inventory: '16Hn6FnhtPplQaLiMXKPIqMWBjoY7l6T4',
  Non_Inventory: '1PN3cEnrDHW0LmVvAJEjNEMASBpdizTES',
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

    let newPermission = {
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

      
      createNewFolder(department, file, drive, function(err, id) {
        if (err) {
          console.error(err);
          return;
        }

        console.log("Count " + file.data.files.length);
        departmentId = id;
        console.log(departmentId);

        let fileMetaData = {
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

function createNewFolder(department, file, drive, callback) {
  const folder = file.data.files.find(value => value["name"] === department);
  if (folder) {
    // If a folder with a different name already exists, return its id
    return callback(null, file.data.files.find(value => value["name"] === department).id);
  }
  else {
    let folderMetaData = {
      name: department,
      mimeType: 'application/vnd.google-apps.folder',
      parents: [mainFolder]
    }
    drive.files.create(
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
  let temp = URL.split('/')[5];
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


module.exports = {compressImage, mainFolder, department, URL, nameEquipment};
