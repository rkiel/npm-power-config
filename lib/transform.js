const _ = require('lodash');

let lib;

function promptUserForValue(state, namespace, object) {
  const answer = lib._input.promptForAnswer(namespace, object);
  return lib._input.convertType(object, answer);
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
    lib._input.set(state, item.namespace, undefined);
  }
}

function save(state, list) {
  _.each(list, item => {
    lib.updateOuput(state, item.namespace, item.value);
    lib.updateInput(state, item);
  });
  return list;
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

function removedUnusedEnvironments(state, list) {
  return _.filter(list, item => lib._environment.isPartOf(state, item.namespace));
}

function flow(initialInputs, ...functions) {
  const newFunctions = _.map(functions, f => (_.isFunction(f) ? f : () => f));
  return _.flow(newFunctions)(...initialInputs);
}

function handlePowerObject(state, json, namespace) {
  const fileName = _.get(json, 'include');
  const concat = _.get(json, 'concat');
  if (fileName) {
    return lib.toIncludeObject(state, namespace, fileName);
  } else if (concat) {
    return lib._power.toConcatObject(state, namespace, concat);
  } else {
    return lib._power.toPowerObjects(json, namespace);
  }
}

function handleUnknownValue(state, namespace, value) {
  if (lib._power.isPowerObject(value)) {
    return lib.handlePowerObject(state, value, namespace);
  } else if (lib._power.isPlainObject(value)) {
    return lib.processObject(state, value, namespace);
  } else {
    return lib._power.handleScalarValue(value, namespace);
  }
}

function toIncludeObject(state, namespace, fileName) {
  const json = lib._file.parse(fileName);
  return lib.handleUnknownValue(state, namespace, json);
}

function processObjectMapper(state, namespace, value, key) {
  const newNamespace = _.concat(namespace, key);
  return lib.handleUnknownValue(state, newNamespace, value);
}

function processObject(state, object, namespace) {
  const mapper = lib.processObjectMapper(state, namespace);
  return _.flatten(_.map(object, mapper));
}

function echo(x) {
  //  console.log(JSON.stringify(x, null, 2));
  return x;
}

function generate(inState) {
  const state = lib._output.initialize(inState);
  const exampleObject = lib._example.get(state);
  const namespace = [];
  return lib.flow(
    [exampleObject, namespace],
    lib.processObject(state),
    lib.echo,
    lib.removedUnusedEnvironments(state),
    lib.getUserInputs(state),
    lib.save(state),
    state
  );
}

lib = {
  _file: require('./file'),
  _environment: require('./environment'),
  _input: require('./input'),
  _output: require('./output'),
  _example: require('./example'),
  _power: require('./power'),

  echo,
  extractPreExistingValue,
  flow,
  generate,
  getUserInputs: _.curry(getUserInputs),
  processObject: _.curry(processObject),
  handlePowerObject,
  handleUnknownValue,
  isThereAPreExistingValue,
  processObjectMapper: _.curry(processObjectMapper),
  promptUserForValue,
  removedUnusedEnvironments: _.curry(removedUnusedEnvironments),
  save: _.curry(save),
  toIncludeObject,
  updateInput,
  updateOuput
};

module.exports = lib;
