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

function _compactReducer(json, value, key) {
  if (!_.isUndefined(value) && !_.isNull(value)) {
    if (_.isObject(value) && !_.isArray(value)) {
      const subJson = lib._compact(value);
      if (!_.isUndefined(subJson) && !_.isNull(subJson)) {
        if (_.isObject(subJson) && !_.isArray(subJson)) {
          if (!_.isEmpty(subJson)) {
            json[key] = subJson;
          }
        } else {
          json[key] = subJson;
        }
      }
    } else {
      json[key] = value;
    }
  }
  return json;
}

function _compact(inJson) {
  const outJson = _.reduce(inJson, lib._compactReducer, {});
  return _.isEmpty(outJson) ? undefined : outJson;
}

function write(pathToFile, json) {
  console.log('Writing', pathToFile);
  const outJson = lib._compact(json);
  const x = _.isUndefined(outJson) ? {} : outJson;
  if (pathToFile.includes('.json')) {
    const data = JSON.stringify(x, null, 2);
    fs.writeFileSync(pathToFile, data, 'utf8');
  } else if (pathToFile.includes('.yml') || pathToFile.includes('.yaml')) {
    const data = yaml.safeDump(x);
    fs.writeFileSync(pathToFile, data, 'utf8');
  }
}
lib = {
  _compact,
  _compactReducer,
  search,
  parse,
  write
};

module.exports = lib;
