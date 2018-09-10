const BhavCopy = require("../index");
const request = new BhavCopy({
  // dir: "xxxx" // optional. if not specified, files will be downloaded under NSE folder
});

request
  .download({
    month: "AUG", // required (values acn be anything given below under Month CODES)
    year: 2016, // required (values acn be anything given below under YEAR CODES)
    day: 18 // optional (values can be anything in range: 1 - 31)
  })
  .then(data => {
    console.log(data); // Wait! Files are downloading...
  })
  .catch(err => {
    console.log(err);
  });
