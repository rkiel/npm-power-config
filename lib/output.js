const _ = require('lodash');

let lib;

function addFileName(state) {
  const fileName = _.get(state, 'program.output');
  if (_.isUndefined(fileName) || _.isNull(fileName)) {
    const parts = _.split(_.get(state, 'example.fileName', lib._example.DEFAULT), '.');
    const doesNotContainExampleWord = x => !_.includes(['example', 'sample'], x);
    const lessParts = _.filter(parts, doesNotContainExampleWord);
    _.set(state, 'output.fileName', lessParts.join('.'));
  } else {
    _.set(state, 'output.fileName', fileName);
  }
  return state;
}

function writeFile(state) {
  const fileName = _.get(state, 'output.fileName');
  const json = _.get(state, 'output.json');
  lib._file.write(fileName, json);
  return state;
}

function convert(x) {
  if (_.startsWith(x, '_') && _.endsWith(x, '_')) {
    return x.replace(/^_/, '').replace(/_$/, '');
  } else {
    return x;
  }
}

function set(state, parts, value) {
  const flattenParts = lib._environment.flatten(state, parts);
  const newParts = _.map(flattenParts, lib.convert);
  return _.set(state, _.concat(['output', 'json'], newParts).join('.'), value);
}

function initialize(state) {
  _.set(state, 'output.json', {});
}

lib = {
  _file: require('./file'),
  _example: require('./example'),
  _environment: require('./environment'),

  addFileName,
  convert,
  writeFile,
  initialize,
  set
};

module.exports = lib;
