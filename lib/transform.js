const _ = require('lodash');

let lib;

function promptUserForValue(state, namespace, object) {
  const answer = lib._input.promptForAnswer(namespace, object);
  return lib._input.convertType(object, answer);
}

function isNamespaceObject(json) {
  return (
    // reserved words
    _.isUndefined(json.description) &&
    _.isUndefined(json.default) &&
    _.isUndefined(json.steps) &&
    _.isUndefined(json.value) &&
    _.isUndefined(json.type) &&
    _.isUndefined(json.environment) &&
    _.isUndefined(json.include)
  );
}

function isHardCodedValueObject(json) {
  const value = _.get(json, 'value');
  return !_.isUndefined(value) && !_.isNull(value);
}

function extractHardCodedValue(json) {
  return _.get(json, 'value');
}

function isIncludeFileObject(json) {
  const value = _.get(json, 'include');
  return !_.isUndefined(value) && !_.isNull(value);
}

function extractIncludeFile(json) {
  return lib._file.parse(_.get(json, 'include'));
}

// TODO: check for value based on 'environment' field too
function isThereAPreExistingValue(state, namespace) {
  const inputValue = lib._input.get(state, namespace);
  return !_.isUndefined(inputValue) && !_.isNull(inputValue);
}

// TODO: get value based on 'environment' field too
function extractPreExistingValue(state, namespace) {
  return lib._input.get(state, namespace);
}

function updateOuput(state, namespace, value) {
  lib._output.set(state, namespace, value);
}

function updateInput(state, namespace, value) {
  lib._input.set(state, namespace, value);
}

function calculateValue(state, namespace, object) {
  if (lib.isHardCodedValueObject(object)) {
    return lib.extractHardCodedValue(object);
  } else if (lib.isIncludeFileObject(object)) {
    return lib.extractIncludeFile(object);
  } else if (lib.isThereAPreExistingValue(state, namespace)) {
    return lib.extractPreExistingValue(state, namespace);
  } else {
    return lib.promptUserForValue(state, namespace, object);
  }
}

function updateValues(state, inNamespace, object, key) {
  const namespace = _.concat(inNamespace, key); // immutable critical for recursion
  const value = lib.calculateValue(state, namespace, object);

  lib.updateOuput(state, namespace, value);
  lib.updateInput(state, namespace, value);
  return state;
}

function processDataFieldObject(state, namespace, object, key) {
  if (lib._environment.shouldIgnore(state, object)) {
    return state;
  } else {
    return lib.updateValues(state, namespace, object, key);
  }
}

function processNamespaceObject(state, inNamespace, namespaceObject, key) {
  const namespace = _.concat(inNamespace, key); // immutable critical for recursion
  return lib.processObject(state, namespaceObject, namespace);
}

function objectIterator(state, namespace, value, key) {
  if (lib.isNamespaceObject(value)) {
    return lib.processNamespaceObject(state, namespace, value, key);
  } else {
    return lib.processDataFieldObject(state, namespace, value, key);
  }
}

function processObject(state, inExampleJson, namespace) {
  const exampleJson = lib._environment.limitScope(state, inExampleJson);
  _.each(exampleJson, lib.objectIterator(state, namespace));
  return state;
}

function generate(inState) {
  const state = lib._output.initialize(inState);
  const exampleJson = lib._example.get(state);
  const namespace = [];
  return lib.processObject(state, exampleJson, namespace);
}

lib = {
  _file: require('./file'),
  _environment: require('./environment'),
  _input: require('./input'),
  _output: require('./output'),
  _example: require('./example'),

  generate,
  objectIterator: _.curry(objectIterator),
  isNamespaceObject,
  isHardCodedValueObject,
  extractHardCodedValue,
  isIncludeFileObject,
  extractIncludeFile,
  isThereAPreExistingValue,
  extractPreExistingValue,
  promptUserForValue,
  updateInput,
  updateOuput,
  updateValues,
  calculateValue,
  processNamespaceObject,
  processDataFieldObject,
  processObject
};

module.exports = lib;
