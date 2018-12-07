const fs = require('fs');

let lib;

function parseJsonFile(pathToFile) {
  if (fs.existsSync(pathToFile)) {
    console.log('Reading', pathToFile);
    const contents = fs.readFileSync(pathToFile, 'utf8');
    const json = JSON.parse(contents);
    return json;
  } else {
    console.error(`${pathToFile} does not exist`);
    process.exit(1);
  }
}

lib = {
  parseJsonFile
};

module.exports = lib.parseJsonFile;
module.exports.lib = lib;
