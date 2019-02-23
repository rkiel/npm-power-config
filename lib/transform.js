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

function toStringValue(value) {
  return { type: 'string', value };
}

function toIntegerValue(value) {
  return { type: 'integer', value };
}

function toBooleanValue(value) {
  return { type: 'boolean', value };
}

function toArrayValue(value) {
  return { type: 'array', value };
}

function toNamespace(namespace) {
  return { namespace };
}

function toDefaults() {
  return { type: 'string' };
}

function toInput(object) {
  let input;
  if (_.isUndefined(_.get(object, 'value')) && _.isUndefined(_.get(object, 'include'))) {
    input = 'user';
  } else {
    input = 'hardCoded';
  }
  return { input };
}

function toScalar(value, namespace) {
  return lib.toPowerObjects(lib.valueToTypeAndValue(value), namespace);
}

function valueToTypeAndValue(value) {
  if (_.isUndefined(value)) {
    return {};
  } else if (_.isString(value)) {
    return lib.toStringValue(value);
  } else if (_.isNumber(value)) {
    return lib.toIntegerValue(value);
  } else if (_.isBoolean(value)) {
    return lib.toBooleanValue(value);
  } else if (_.isArray(value)) {
    return lib.toArrayValue(value);
  } else {
    throw `unknown scalar: ${value}`;
  }
}

function toPowerObject(object, namespace) {
  return _.assign(
    {},
    lib.toDefaults(),
    lib.toNamespace(namespace),
    lib.toInput(object),
    lib.valueToTypeAndValue(object.value),
    object
  );
}

function overrideNamespace(object, namespace, env) {
  return _.assign({}, object, { namespace: _.concat(namespace, env) });
}

function removeEnvironment(object) {
  return _.omit(object, ['environment']);
}

function expandObjectIntoObjects(powerObject, namespace) {
  const powerObjects = [];
  const env = powerObject.environment;
  const npo = lib.removeEnvironment(powerObject);
  if (env) {
    if (_.isString(env)) {
      const po = lib.overrideNamespace(npo, namespace, env);
      powerObjects.push(po);
    } else if (_.isArray(env)) {
      const pos = _.map(env, e => lib.overrideNamespace(npo, namespace, e));
      powerObjects.push(pos);
    }
  } else {
    powerObjects.push(powerObject);
  }
  return _.flatten(powerObjects);
}

function toPowerObjects(object, namespace) {
  const powerObject = lib.toPowerObject(object, namespace);
  return lib.expandObjectIntoObjects(powerObject, namespace);
}

function isPowerObjectReducer(object, boolean, path) {
  return boolean ? boolean : !_.isUndefined(_.get(object, path));
}

function isScalar(value) {
  return !lib.isPowerObject(value) && !lib.isPlainObject(value);
}

function isPlainObject(object) {
  return lib.isJavaScriptObject(object) && !lib.hasPower(object);
}

function isJavaScriptObject(object) {
  return _.isObject(object) && !_.isArray(object);
}

function hasPower(object) {
  return _.reduce(
    ['type', 'description', 'default', 'environment', 'include', 'steps', 'value', 'concat'],
    lib.isPowerObjectReducer(object),
    false
  );
}

function isPowerObject(object) {
  return lib.isJavaScriptObject(object) && lib.hasPower(object);
}

function handlePowerObject(state, json, namespace) {
  const fileName = _.get(json, 'include');
  const concat = _.get(json, 'concat');
  if (fileName) {
    return lib.toIncludeObject(state, namespace, fileName);
  } else if (concat) {
    return lib.toConcatObject(state, namespace, concat);
  } else {
    return lib.toPowerObjects(json, namespace);
  }
}

function handleObject(state, namespace, value) {
  if (lib.isPowerObject(value)) {
    return lib.handlePowerObject(state, value, namespace);
  } else if (lib.isPlainObject(value)) {
    return lib.toObjects(state, value, namespace);
  } else {
    return lib.toScalar(value, namespace);
  }
}

function toIncludeObject(state, namespace, fileName) {
  const json = lib._file.parse(fileName);
  return lib.handleObject(state, namespace, json);
}

function toConcatObjectMapper(state, item) {
  if (item.include) {
    return lib._file.read(item.include);
  } else if (item.environment) {
    const scope = lib._environment.scope(state);
    const fileName = item.environment[scope];
    if (fileName) {
      return lib._file.read(fileName);
    }
  }
}

function toConcatObject(state, namespace, concat) {
  const content = _.map(concat, lib.toConcatObjectMapper(state));
  return lib.toScalar(_.compact(content).join('\n'), namespace);
}

function objectMapper(state, namespace, value, key) {
  const newNamespace = _.concat(namespace, key);
  return lib.handleObject(state, newNamespace, value);
}

function toObjects(state, inExampleJson, namespace) {
  return _.flatten(_.map(inExampleJson, lib.objectMapper(state, namespace)));
}

function echo(x) {
  //  console.log(JSON.stringify(x, null, 2));
  return x;
}

function generate(inState) {
  const state = lib._output.initialize(inState);
  const exampleJson = lib._example.get(state);
  const namespace = [];
  return lib.flow(
    [exampleJson, namespace],
    lib.toObjects(state),
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

  generate,
  objectMapper: _.curry(objectMapper),
  isThereAPreExistingValue,
  extractPreExistingValue,
  promptUserForValue,
  updateInput,
  updateOuput,
  toInput,
  isScalar,
  isPowerObject,
  isJavaScriptObject,
  hasPower,
  isPlainObject,
  toPowerObject,
  toPowerObjects,
  toIncludeObject,
  toConcatObject,
  toConcatObjectMapper: _.curry(toConcatObjectMapper),
  toObjects: _.curry(toObjects),
  handlePowerObject,
  handleObject,
  toScalar,
  valueToTypeAndValue,
  toDefaults,
  toNamespace,
  toStringValue,
  toIntegerValue,
  toBooleanValue,
  toArrayValue,
  expandObjectIntoObjects,
  removeEnvironment,
  overrideNamespace,
  echo,
  flow,
  save: _.curry(save),
  getUserInputs: _.curry(getUserInputs),
  isPowerObjectReducer: _.curry(isPowerObjectReducer),
  removedUnusedEnvironments: _.curry(removedUnusedEnvironments)
};

module.exports = lib;
