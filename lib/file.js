const _ = require('lodash');
const fs = require('fs');
const yaml = require('js-yaml');

let lib;

function search(searchFor) {
  return _.reduce(searchFor, (a, e) => (a !== false ? a : fs.existsSync(e) ? e : false), false);
}

function parse(pathToFile, defaultValue) {
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

function write(pathToFile, json) {
  console.log('Writing', pathToFile);
  if (pathToFile.includes('.json')) {
    const data = JSON.stringify(json, null, 2);
    fs.writeFileSync(pathToFile, data, 'utf8');
  } else if (pathToFile.includes('.yml') || pathToFile.includes('.yaml')) {
    const data = yaml.safeDump(json);
    fs.writeFileSync(pathToFile, data, 'utf8');
  }
}
lib = {
  search,
  parse,
  write
};

module.exports = lib;
