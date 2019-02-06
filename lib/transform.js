const _ = require('lodash');

let lib;

function promptUserForValue(state, namespace, object) {
  const answer = lib._input.promptForAnswer(namespace, object);
  return lib._input.convertType(object, answer);
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

function updateInput(state, item) {
  if (item.input === 'user') {
    lib._input.set(state, item.namespace, item.value);
  } else {
  }
}

function save(state, list) {
  return _.each(list, item => {
    lib.updateOuput(state, item.namespace, item.value);
    lib.updateInput(state, item);
  });
}

function getIncludeFiles(state, list) {
  return _.map(list, item => {
    if (_.isUndefined(item.include)) {
      return item;
    } else {
      const value = lib.extractIncludeFile(item);
      return _.assign({}, item, { value });
    }
  });
}

function getUserInputs(state, list) {
  return _.map(list, item => {
    if (item.input === 'user') {
      let value;
      if (lib.isThereAPreExistingValue(state, item.namespace)) {
        value = lib.extractPreExistingValue(state, item.namespace);
      } else {
        value = lib.promptUserForValue(state, item.namespace, item);
      }
      return _.assign({}, item, { value });
    } else {
      return item;
    }
  });
}
function removedUnuseEnvironments(state, list) {
  return _.filter(list, item => lib._environment.isPartOf(state, item.namespace));
}

function processList(state) {
  const list = _.get(state, 'transform.list');
  return _.flow([
    lib.removedUnuseEnvironments(state),
    lib.getUserInputs(state),
    lib.getIncludeFiles(state),
    lib.save(state)
  ])(list);
}

function powerString(value) {
  return { type: 'string', value };
}

function powerInteger(value) {
  return { type: 'integer', value };
}

function powerBoolean(value) {
  return { type: 'boolean', value };
}

function powerArray(value) {
  return { type: 'array', value };
}

function powerNamespace(namespace) {
  return { namespace };
}

function powerDefaults() {
  return { type: 'string' };
}

function powerInput(object) {
  let input;
  if (_.isUndefined(_.get(object, 'value')) && _.isUndefined(_.get(object, 'include'))) {
    input = 'user';
  } else {
    input = 'hardCoded';
  }
  return { input };
}

function processScalar(state, value, namespace) {
  if (_.isString(value)) {
    lib.processPowerObject(state, lib.powerString(value), namespace);
  } else if (_.isNumber(value)) {
    lib.processPowerObject(state, lib.powerInteger(value), namespace);
  } else if (_.isBoolean(value)) {
    lib.processPowerObject(state, lib.powerBoolean(value), namespace);
  } else if (_.isArray(value)) {
    lib.processPowerObject(state, lib.powerArray(value), namespace);
  } else {
    throw `unknown scalar: ${value}`;
  }
}

function expandForEnvironment(state, namespace, powerObject, env) {
  let po = _.assign({}, powerObject, { namespace: _.concat(namespace, env) });
  po = _.omit(po, ['environment']);
  _.get(state, 'transform.list').push(po);
}

function processPowerObject(state, object, namespace) {
  const powerObject = _.assign({}, lib.powerDefaults(), lib.powerNamespace(namespace), lib.powerInput(object), object);
  const env = powerObject.environment;
  if (env) {
    if (_.isString(env)) {
      lib.expandForEnvironment(state, namespace, powerObject, env);
    } else if (_.isArray(env)) {
      _.each(env, e => lib.expandForEnvironment(state, namespace, powerObject, e));
    }
  } else {
    _.get(state, 'transform.list').push(powerObject);
  }
}

function isPowerObjectReducer(object, boolean, path) {
  return boolean ? boolean : _.get(object, path);
}

function isPowerObject(object) {
  return _.reduce(
    ['type', 'description', 'default', 'environment', 'include', 'steps', 'value'],
    lib.isPowerObjectReducer(object),
    false
  );
}

function objectIterator(state, namespace, value, key) {
  const newNamespace = _.concat(namespace, key);
  if (_.isArray(value)) {
    lib.processScalar(state, value, newNamespace);
  } else if (_.isObject(value)) {
    if (lib.isPowerObject(value)) {
      lib.processPowerObject(state, value, newNamespace);
    } else {
      lib.processObject(state, value, newNamespace);
    }
  } else {
    lib.processScalar(state, value, newNamespace);
  }
}

function processObject(state, inExampleJson, namespace) {
  return _.each(inExampleJson, lib.objectIterator(state, namespace));
}

function generate(inState) {
  const state = lib._output.initialize(inState);
  const exampleJson = lib._example.get(state);
  const namespace = [];
  _.set(state, 'transform.list', []);
  lib.processObject(state, exampleJson, namespace);
  const list = lib.processList(state);
  return state;
}

lib = {
  _file: require('./file'),
  _environment: require('./environment'),
  _input: require('./input'),
  _output: require('./output'),
  _example: require('./example'),

  generate,
  objectIterator: _.curry(objectIterator),
  extractIncludeFile,
  isThereAPreExistingValue,
  extractPreExistingValue,
  promptUserForValue,
  updateInput,
  updateOuput,
  powerInput,
  isPowerObject,
  processPowerObject,
  processObject,
  processScalar,
  powerDefaults,
  powerNamespace,
  powerString,
  powerInteger,
  powerBoolean,
  powerArray,
  processList,
  expandForEnvironment,
  save: _.curry(save),
  getUserInputs: _.curry(getUserInputs),
  getIncludeFiles: _.curry(getIncludeFiles),
  isPowerObjectReducer: _.curry(isPowerObjectReducer),
  removedUnuseEnvironments: _.curry(removedUnuseEnvironments)
};

module.exports = lib;
