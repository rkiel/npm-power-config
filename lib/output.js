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

function set(state, parts, value) {
  return _.set(state, _.concat(['output', 'json'], parts).join('.'), value);
}

function promptForInput(state, parts, object) {
  const answer = lib._input.promptForAnswer(parts, object);
  return lib._input.convertType(object, answer);
}

function isPathObject(json) {
  return (
    _.get(json, '_path_') === true ||
    (_.isUndefined(json.description) &&
      _.isUndefined(json.steps) &&
      _.isUndefined(json.value) &&
      _.isUndefined(json.type))
  );
}

function isValueObject(json) {
  const value = _.get(json, 'value');
  return !_.isUndefined(value) && !_.isNull(value);
}

function doesInputValueExist(state, parts) {
  const inputValue = lib._input.get(state, parts);
  return !_.isUndefined(inputValue) && !_.isNull(inputValue);
}

function withoutPath(json) {
  return _.omit(json, ['_path_']);
}

function processPathObject(state, parts, object, key) {
  return lib.processObject(state, lib.withoutPath(object), _.concat(parts, key));
}

function processNonPathObject(state, parts, object, key) {
  const nextParts = _.concat(parts, key);
  let nextValue;
  if (lib.isValueObject(object)) {
    nextValue = _.get(object, 'value');
  } else if (lib.doesInputValueExist(state, nextParts)) {
    nextValue = lib._input.get(state, nextParts);
  } else {
    nextValue = lib.promptForInput(state, nextParts, object);
  }
  lib.set(state, nextParts, nextValue);
  lib._input.set(state, nextParts, nextValue);
}

function valueKeyIterator(state, parts, object, key) {
  if (lib.isPathObject(object)) {
    return lib.processPathObject(state, parts, object, key);
  } else {
    return lib.processNonPathObject(state, parts, object, key);
  }
}

function processObject(state, json, parts = []) {
  _.each(lib._environment.limitScope(state, json), lib.valueKeyIterator(state, parts));
  return state;
}

function generate(state) {
  _.set(state, 'output.json', {});
  return lib.processObject(state, lib._example.get(state));
}

lib = {
  _file: require('./file'),
  _environment: require('./environment'),
  _input: require('./input'),
  _example: require('./example'),

  addFileName,
  writeFile,
  generate,
  valueKeyIterator: _.curry(valueKeyIterator),
  isPathObject,
  isValueObject,
  doesInputValueExist,
  promptForInput,
  processPathObject,
  processNonPathObject,
  processObject,
  withoutPath,
  set
};

module.exports = lib;
