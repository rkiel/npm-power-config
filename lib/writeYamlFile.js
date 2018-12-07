const yaml = require('js-yaml');
const fs = require('fs');

let lib;

function writeJsonFile(pathToFile, json) {
  console.log('Writing', pathToFile);
  const data = yaml.safeDump(json);
  fs.writeFileSync(pathToFile, data, 'utf8');
}

lib = {
  writeJsonFile
};

module.exports = lib.writeJsonFile;
module.exports.lib = lib;
