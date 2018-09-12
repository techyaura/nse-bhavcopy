# NSE-Bhavcopy

[![NPM](https://nodei.co/npm/nse-bhavcopy.png??downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/nse-bhavcopy/)

Node-Js module for downloading NSE bhavcopy from NSE server.

To use, follow the below instructions:

```
const options = {
 type: 'json' // optional. if not specified, zip file will be downloaded. Valid TYPES: ['json', 'csv', 'zip']
 dir: "xxxx" // optional. if not specified, files will be downloaded under NSE folder
};
const request = new BhavCopy(options);

request
 .download({
   month: "MAY", // required (values can be anything as given below under MONTH CODES)
   year: 2016, // required (values can be anything as given below under YEAR CODES)
   day: 10 // optional (values can be anything in range: 1 - 31)
 })
 .then(data => {
   console.log(data); // Wait! Files are downloading...
 })
 .catch(err => {
   console.log(err);
 });
```

## Vaild Values@

```
TYPES:
 'json',
 'csv',
 'zip'

MONTH CODES:
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

YEAR CODES:
2018,
2017,
2016
```

## Features!

- Download bhavcopy for a specified day
- Or Download bhavcopy for entire month of a specified year

## What's new in v1.0.0

v1.0.0 now supports csv & json format as well.

## Requirement

nse-bhavcopy requires [Node.js](https://nodejs.org/) v8+ to run.

## Github

[Github](https://github.com/techyaura/nse-bhavcopy)

## Unit Test

npm test

## Issues

Please post your issues for further improvement or fixes if any:
[Github](https://github.com/techyaura/nse-bhavcopy/issues/new)
