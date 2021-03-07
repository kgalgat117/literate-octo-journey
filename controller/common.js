var XLSX = require('xlsx');

var commons = {}

function sheetToJson(path) {
    var sheetData = {}
    var workbook = XLSX.readFile(path);
    sheetData['data'] = XLSX.utils.sheet_to_json(workbook.Sheets['data-sheet'])
    return sheetData
}

function splitToChunks(array, parts) {
    let result = [];
    for (let i = parts; i > 0; i--) {
        result.push(array.splice(0, Math.ceil(array.length / i)));
    }
    return result;
}

commons.sheetToJson = sheetToJson
commons.splitToChunks = splitToChunks

module.exports = commons