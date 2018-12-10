const _ = require('lodash');

let lib;

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
      _.isUndefined(json.type) &&
      _.isUndefined(json.environment))
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
  if (lib._environment.shouldIgnore(state, object)) {
    nextValue = null;
  } else if (lib.isValueObject(object)) {
    nextValue = _.get(object, 'value');
  } else if (lib.doesInputValueExist(state, nextParts)) {
    nextValue = lib._input.get(state, nextParts);
  } else {
    nextValue = lib.promptForInput(state, nextParts, object);
  }
  if (nextValue !== null) {
    lib._output.set(state, nextParts, nextValue);
    lib._input.set(state, nextParts, nextValue);
  }
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
  lib._output.initialize(state);
  return lib.processObject(state, lib._example.get(state));
}

lib = {
  _environment: require('./environment'),
  _input: require('./input'),
  _output: require('./output'),
  _example: require('./example'),

  generate,
  valueKeyIterator: _.curry(valueKeyIterator),
  isPathObject,
  isValueObject,
  doesInputValueExist,
  promptForInput,
  processPathObject,
  processNonPathObject,
  processObject,
  withoutPath
};

module.exports = lib;
