const _ = require('lodash');

let lib;

function promptForInput(state, namespace, object) {
  const answer = lib._input.promptForAnswer(namespace, object);
  return lib._input.convertType(object, answer);
}

function isNamespaceObject(json) {
  return (
    _.get(json, '_path_') === true ||
    // reserved words
    (_.isUndefined(json.description) &&
      _.isUndefined(json.steps) &&
      _.isUndefined(json.value) &&
      _.isUndefined(json.type) &&
      _.isUndefined(json.environment) &&
      _.isUndefined(json.include))
  );
}

function isValueObject(json) {
  const value = _.get(json, 'value');
  return !_.isUndefined(value) && !_.isNull(value);
}

function isIncludeObject(json) {
  const value = _.get(json, 'include');
  return !_.isUndefined(value) && !_.isNull(value);
}

function doesInputValueExist(state, namespace) {
  const inputValue = lib._input.get(state, namespace);
  return !_.isUndefined(inputValue) && !_.isNull(inputValue);
}

function withoutPath(json) {
  return _.omit(json, ['_path_']);
}

function processDataFieldObject(state, namespace, object, key) {
  const newNamespace = _.concat(namespace, key);
  let nextValue;
  if (lib._environment.shouldIgnore(state, object)) {
    nextValue = null;
  } else if (lib.isValueObject(object)) {
    nextValue = _.get(object, 'value');
  } else if (lib.isIncludeObject(object)) {
    nextValue = lib._file.parse(object.include);
  } else if (lib.doesInputValueExist(state, newNamespace)) {
    nextValue = lib._input.get(state, newNamespace);
  } else {
    nextValue = lib.promptForInput(state, newNamespace, object);
  }
  if (nextValue !== null) {
    lib._output.set(state, newNamespace, nextValue);
    lib._input.set(state, newNamespace, nextValue);
  }
}

function processNamespaceObject(state, inNamespace, value, key) {
  const namespace = _.concat(inNamespace, key);
  return lib.processObject(state, value, namespace);
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
  isValueObject,
  isIncludeObject,
  doesInputValueExist,
  promptForInput,
  processNamespaceObject,
  processDataFieldObject,
  processObject,
  withoutPath
};

module.exports = lib;
