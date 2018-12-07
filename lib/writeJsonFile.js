const fs = require('fs');

let lib;

function writeJsonFile(pathToFile, json) {
  console.log('Writing', pathToFile);
  const data = JSON.stringify(json, null, 2);
  fs.writeFileSync(pathToFile, data, 'utf8');
}

lib = {
  writeJsonFile
};

module.exports = lib.writeJsonFile;
module.exports.lib = lib;
