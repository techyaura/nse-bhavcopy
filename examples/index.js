const BhavCopy = require("../index");
const options = {
   type: 'json'  // optional. if not specified, zip file will be downloaded valid TYPES: ['json', 'csv', 'zip']
  // dir: "xxxx" // optional. if not specified, files will be downloaded under NSE folder
};
const request = new BhavCopy(options);

request
  .download({
    month: "FEB", // required (values acn be anything given below under Month CODES)
    year: 2019, // required (values acn be anything given below under YEAR CODES)
    day: 15 // optional (values can be anything in range: 1 - 31)
  })
  .then(data => {
    console.log(data); // Wait! Files are downloading...
  })
  .catch(err => {
    console.log(err);
  });
