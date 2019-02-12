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
  if (_.isString(value)) {
    return lib.toPowerObjects(lib.toStringValue(value), namespace);
  } else if (_.isNumber(value)) {
    return lib.toPowerObjects(lib.toIntegerValue(value), namespace);
  } else if (_.isBoolean(value)) {
    return lib.toPowerObjects(lib.toBooleanValue(value), namespace);
  } else if (_.isArray(value)) {
    return lib.toPowerObjects(lib.toArrayValue(value), namespace);
  } else {
    throw `unknown scalar: ${value}`;
  }
}

function toPowerObject(object, namespace) {
  return _.assign({}, lib.toDefaults(), lib.toNamespace(namespace), lib.toInput(object), object);
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
  return _.isJavaScriptObject(object) && !lib.hasPower(object);
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

function objectMapper(namespace, value, key) {
  const newNamespace = _.concat(namespace, key);
  let objects;

  if (lib.isPowerObject(value)) {
    const fileName = _.get(value, 'include');
    const concat = _.get(value, 'concat');
    if (fileName) {
      const json = lib._file.parse(fileName);
      if (lib.isPowerObject(json)) {
        return lib.toPowerObjects(json, newNamespace);
      } else if (_.isPlainObject(json)) {
        return lib.toObjects(json, newNamespace);
      } else {
        return lib.toScalar(json, newNamespace);
      }
    } else if (concat) {
      const content = _.map(concat, item => {
        if (item.include) {
          return lib._file.read(item.include);
        }
      });
      return lib.toScalar(content.join('\n'), newNamespace);
    } else {
      return lib.toPowerObjects(value, newNamespace);
    }
  } else if (_.isObject(value)) {
    return lib.toObjects(value, newNamespace);
  } else {
    return lib.toScalar(value, newNamespace);
  }
}

function toObjects(inExampleJson, namespace) {
  return _.flatten(_.map(inExampleJson, lib.objectMapper(namespace)));
}

function generate(inState) {
  const state = lib._output.initialize(inState);
  const exampleJson = lib._example.get(state);
  const namespace = [];
  return lib.flow(
    [exampleJson, namespace],
    lib.toObjects,
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
  toObjects,
  toScalar,
  toDefaults,
  toNamespace,
  toStringValue,
  toIntegerValue,
  toBooleanValue,
  toArrayValue,
  expandObjectIntoObjects,
  removeEnvironment,
  overrideNamespace,
  flow,
  save: _.curry(save),
  getUserInputs: _.curry(getUserInputs),
  isPowerObjectReducer: _.curry(isPowerObjectReducer),
  removedUnusedEnvironments: _.curry(removedUnusedEnvironments)
};

module.exports = lib;
