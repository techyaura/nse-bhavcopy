class BhavCopy {
  constructor(options) {
    this.request = require("request");
    this.fs = require("fs");
    const { dir } = options;
    this.customDir = dir !== "undefined" ? dir : "";
  }

  monthsCode() {
    const monthArray = [
      "JAN",
      "FEB",
      "MAR",
      "APR",
      "MAY",
      "JUN",
      "JUL",
      "AUG",
      "SEP",
      "OCT",
      "NOV",
      "DEC"
    ];
    return monthArray;
  }

  yearsCode() {
    return [2016, 2017, 2018];
  }

  daysCode() {
    let daysArray = [];
    for (let i = 1; i <= 31; i++) {
      let day;
      if (i < 10) {
        day = "0" + i;
      } else {
        day = i;
      }
      daysArray.push(day);
    }
    return daysArray;
  }

  appendZeroToDay(number) {
    let newNum = "";
    if (number < 10) {
      newNum = "0" + parseInt(number);
    } else {
      newNum = number;
    }
    return newNum;
  }

  createDir(dir) {
    this.dir = this.customDir || dir;
    const parts = dir.split("/");
    const partsLength = parts.length;
    let i = 0;
    let path = "";
    while (i < partsLength) {
      if (parts[i]) {
        path = path + parts[i];
        if (!this.fs.existsSync(path)) {
          this.fs.mkdirSync(path);
        }
      }
      path = path + "/";
      i++;
    }
    return path;
  }

  generateFileNames(criteria) {
    const { month, year, day } = criteria;
    const baseUrl = "https://nseindia.com/content/historical/EQUITIES/";
    const allFilesPathInMonth = [];
    if (!day || day === undefined) {
      for (let i = 1; i <= 31; i++) {
        let day;
        let fileName;
        let url;
        if (i < 10) {
          day = "0" + i;
        } else {
          day = i;
        }
        fileName = "cm" + day + month + year + "bhav" + ".csv.zip";
        url = baseUrl + year + "/" + month + "/" + fileName;
        allFilesPathInMonth.push(url);
      }
    } else {
      const fileName = "cm" + day + month + year + "bhav" + ".csv.zip";
      const url = baseUrl + year + "/" + month + "/" + fileName;
      allFilesPathInMonth.push(url);
    }
    return allFilesPathInMonth;
  }

  getBhavCopyFromNSE(fileName) {
    if (fileName) {
      const parts = fileName.split("/");
      const originalFileName = parts.pop();
      return this.callNSEforFile(fileName)
        .then(streamObj => {
          streamObj.on("response", response => {
            if (response.statusCode === 200) {
              streamObj.pipe(
                this.fs.createWriteStream(this.dir + "/" + originalFileName)
              );
              return {
                message: "Download successful"
              };
            } else {
              const fileNotFoundDate = fileName
                .replace(".csv.zip", "")
                .replace("cm", "")
                .replace("bhav", "");
              return {
                download: "File Not Found on " + fileNotFoundDate
              };
            }
          });
        })
        .catch(err => {
          return Promise.reject(err);
        });
    }
  }

  callNSEforFile(reqUrl) {
    const reqOpts = {
      url: reqUrl,
      method: "GET",
      headers: { "Cache-Control": "no-cache" }
    };
    return new Promise((resolve, reject) => {
      try {
        const requestStream = this.request(reqOpts);
        return resolve(requestStream);
      } catch (err) {
        return reject(err);
      }
    });
  }

  download(reqObject) {
    return new Promise((resolve, reject) => {
      let { month, year, day } = reqObject;
      if (
        month === undefined ||
        month === "" ||
        month === null ||
        this.monthsCode().indexOf(month) === -1
      ) {
        return reject({
          message: "Invalid month name"
        });
      }

      if (
        year === undefined ||
        year === "" ||
        year === null ||
        this.yearsCode().indexOf(parseInt(year)) === -1
      ) {
        return reject({
          message: "Invalid year name"
        });
      }
      if (day !== undefined && day !== "" && day !== null) {
        day = parseInt(day);
        if (typeof day !== "number") {
          return reject({
            message: "Invalid day specified"
          });
        }
        const newday = this.appendZeroToDay(day);
        if (this.daysCode().indexOf(newday) === -1) {
          return reject({
            message: "Invalid day specified"
          });
        }
        day = newday;
      } else {
        day = "";
      }
      const baseDir = "NSE/" + year + "/" + month;
      this.createDir(baseDir);
      const generateFileNamesArray = this.generateFileNames({
        month,
        year,
        day
      });
      const promiseArray = [];
      if (
        Array.isArray(generateFileNamesArray) &&
        generateFileNamesArray.length
      ) {
        generateFileNamesArray.forEach((item, index) => {
          promiseArray.push(this.getBhavCopyFromNSE(item));
        });
      }
      return Promise.all(promiseArray)
        .then(data => {
          return resolve('Wait! Files are downloading...');
        })
        .catch(err => {
          return reject(err);
        });
    });
  }
}

module.exports = BhavCopy;
