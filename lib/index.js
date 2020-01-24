class BhavCopy {
    /**
     * Construct a new nse-bhavcopy client
     *
     * @constructor
     * @param string dir      Specify the directory for downloading files
     */
    constructor(options = {}) {
      this.request = require("request");
      this.fs = require("fs");
      const { dir, type } = options;
      this.customDir = dir && dir !== undefined && dir !== "undefined" ? dir : "";
      this.fileType =
        type &&
        type !== undefined &&
        type !== "undefined" &&
        this.__validateFileType().indexOf(type) !== -1
          ? type
          : "zip";
      this.isMultiplesFile = false;
    }
  
    /**
     * Validate file types
     *
     * @return fileTypes
     */
    __validateFileType() {
      const fileTypes = ["csv", "zip", "json"];
      return fileTypes;
    }
  
    /**
     * Get Current year
     *
     * @return year
     */
    __getCurrentYear() {
      const currentTime = new Date();
      const year = currentTime.getFullYear();
      return year;
    }
  
    /**
     * Generate months code array
     *
     * @return monthArray
     */
    __monthsCode() {
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
  
    /**
     * Generate years code array
     *
     * @return yearsCode
     */
    __yearsCode() {
      const currentYear = this.__getCurrentYear();
      const yearsArray = [];
      for (let year = 1994; year <= currentYear; year++) {
        yearsArray.push(year);
      }
      return yearsArray;
    }
  
    /**
     * Generate days code array
     *
     * @return daysArray
     */
    __daysCode() {
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
    /**
     * Generate days code array
     *
     * @param  number          day        The day for downloading bhavcopy
     * @return newNum
     */
    __appendZeroToDay(day) {
      let newNum = "";
      if (day < 10) {
        newNum = "0" + parseInt(day);
      } else {
        newNum = day;
      }
      return newNum;
    }
  
    /**
     * Create dynamic directories if not exist
     *
     * @param  string          dir        The directory for downloading bhavcopy
     * @return path
     */
    __createDir(dir) {
      this.baseDir = dir;
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
  
    /**
     * Generate files paths from NSE server
     *
     * @param  string          month        The month for downloading bhavcopy
     * @param  string          year        The year for downloading bhavcopy
     * @param  string          day       The day for downloading bhavcopy
     * @return allFilesPathInMonth
     */
    __generateFileNames(criteria) {
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
      if (allFilesPathInMonth.length > 1) {
        this.isMultiplesFile = true;
      }
      return allFilesPathInMonth;
    }
  
    /**
     * Configure file url to get data from NSE server
     *
     * @param  string          fileName        The filename of downloading bhavcopy
     * @return Promise
     */
    __getBhavCopyFromNSE(fileName) {
      if (fileName) {
        const parts = fileName.split("/");
        let originalFileName = parts.pop();
        return new Promise((resolve, reject) => {
          return this.__callNSEforFile(fileName)
            .then(streamObj => {
              if (
                streamObj &&
                typeof streamObj === "object" &&
                Object.keys(streamObj).length
              ) {
                streamObj.on("response", response => {
                  const fileDate = originalFileName
                    .replace(".csv.zip", "")
                    .replace("cm", "")
                    .replace("bhav", "");
                  if (response.statusCode === 200) {
                    const unzip = require("unzip");
                    if (this.fileType === "csv") {
                      streamObj.pipe(unzip.Extract({ path: this.baseDir }));
  
                      return resolve({
                        message:
                          originalFileName +
                          " has been downloaded successfull for the date " +
                          fileDate
                      });
                    } else if (this.fileType === "json") {
                      streamObj
                        .pipe(unzip.Extract({ path: this.baseDir }))
                        .on("error",()=>{return reject('Error in bhavcopy download.')})
                        .on("close", async () => {
                          try {
                            const csv = require("csvtojson/v2");
                            const csvPath =
                              "./" +
                              this.baseDir +
                              "/" +
                              originalFileName.replace(".zip", "");
                            const jsonArray = await csv().fromFile(csvPath);
                            this.fs.unlinkSync(csvPath);
                            return resolve(jsonArray);
                          } catch (err) {
                            return reject(err);
                          }
                        });
                    } else if (this.fileType === "zip") {
                      streamObj.pipe(
                        this.fs.createWriteStream(
                          this.baseDir + "/" + originalFileName
                        )
                      );
                      return resolve({
                        message:
                          originalFileName +
                          " has been downloaded successfull for the date " +
                          fileDate
                      });
                    }
                  } else if (response.statusCode === 403) {
                    return resolve({
                      message: "Access Denied: for the file on date " + fileDate
                    });
                  } else {
                    if (this.isMultiplesFile !== true) {
                      return resolve({
                        message:
                          "Bhavcopy is not available for the date: " + fileDate
                      });
                    }
                    return resolve({});
                  }
                });
              } else {
                return reject({
                  message:
                    "Server is temporarily down. Please try after some time."
                });
              }
            })
            .catch(err => {
              return Promise.reject(err);
            });
        });
      }
    }
  
    /**
     * Call NSE server to get bhav copy
     *
     * @param  string          reqUrl        The NSE url for bhav copy
     * @return Promise
     */
    __callNSEforFile(reqUrl) {
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
  
    /**
     * Public access method to download bhav copies from NSE server
     *
     * @param  string          month        The month for downloading bhavcopy
     * @param  string          year        The year for downloading bhavcopy
     * @param  string          day       The day for downloading bhavcopy
     * @return Promise
     */
    download(reqObject) {
      return new Promise((resolve, reject) => {
        let { month, year, day } = reqObject;
        if (
          month === undefined ||
          month === "" ||
          month === null ||
          this.__monthsCode().indexOf(month) === -1
        ) {
          return reject({
            message: "Invalid month name"
          });
        }
        if (
          year === undefined ||
          year === "" ||
          year === null ||
          this.__yearsCode().indexOf(parseInt(year)) === -1
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
          const newday = this.__appendZeroToDay(day);
          if (this.__daysCode().indexOf(newday) === -1) {
            return reject({
              message: "Invalid day specified"
            });
          }
          day = newday;
        } else {
          day = "";
        }
        let baseDir = "NSE/" + year + "/" + month;
        if (this.customDir) {
          baseDir = this.customDir;
        }
        this.__createDir(baseDir);
        const generateFileNamesArray = this.__generateFileNames({
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
            promiseArray.push(this.__getBhavCopyFromNSE(item));
          });
        }
        return Promise.all(promiseArray)
          .then(array => {
            const newArray = array.filter(value => Object.keys(value).length !== 0);
            return resolve(newArray);
          })
          .catch(err => {
            return reject(err);
          });
      });
    }
  }
  
  module.exports = BhavCopy;
  
