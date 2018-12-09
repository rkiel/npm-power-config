const yaml = require('js-yaml');

const fs = require('fs');

let lib;

function parseFile(pathToFile, defaultValue) {
  if (fs.existsSync(pathToFile)) {
    console.log('Reading', pathToFile);
    const contents = fs.readFileSync(pathToFile, 'utf8');
    if (pathToFile.includes('.json')) {
      return JSON.parse(contents);
    } else if (pathToFile.includes('.yml') || pathToFile.includes('.yaml')) {
      return yaml.safeLoad(contents);
    }
  } else if (defaultValue) {
    return defaultValue;
  } else {
    console.error(`${pathToFile} does not exist`);
    process.exit(1);
  }
}

lib = {
  parseFile
};

module.exports = lib.parseFile;
module.exports.lib = lib;
