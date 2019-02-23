const _ = require('lodash');

let lib;

function defaults() {
  return { type: 'string' };
}

function namespace(ns) {
  return { namespace: ns };
}

function input(powerObject) {
  let input;
  if (lib.isHardCoded(powerObject)) {
    input = 'hardCoded';
  } else {
    input = 'user';
  }
  return { input };
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

function convertToPowerObjects(state, namespace, object) {
  const powerObject = lib.toObject(object, namespace);
  return lib.expandObjectIntoObjects(powerObject, namespace);
}

function processScalarValue(state, namespace, value) {
  return lib.convertToPowerObjects(state, namespace, lib.scalarValue(value));
}

function toObject(powerObject, namespace) {
  return _.assign(
    {},
    lib.defaults(),
    lib.namespace(namespace),
    lib.input(powerObject),
    lib.valueToScalar(powerObject),
    powerObject
  );
}

function valueOf(powerObject) {
  return _.get(powerObject, 'value');
}

function isHardCoded(powerObject) {
  return (
    !_.isUndefined(lib.valueOf(powerObject)) ||
    !_.isUndefined(_.get(powerObject, 'include')) ||
    !_.isUndefined(_.get(powerObject, 'concat'))
  );
}

function stringToPowerObject(value) {
  return { type: 'string', value };
}
function integerToPowerObject(value) {
  return { type: 'integer', value };
}
function booleanToPowerObject(value) {
  return { type: 'boolean', value };
}
function arrayToPowerObject(value) {
  return { type: 'array', value };
}

function scalarValue(value) {
  if (_.isUndefined(value)) {
    return {};
  } else if (_.isString(value)) {
    return lib.stringToPowerObject(value);
  } else if (_.isNumber(value)) {
    return lib.integerToPowerObject(value);
  } else if (_.isBoolean(value)) {
    return lib.booleanToPowerObject(value);
  } else if (_.isArray(value)) {
    return lib.arrayToPowerObject(value);
  } else {
    throw `unknown scalar: ${value}`;
  }
}
function valueToScalar(powerObject) {
  return lib.scalarValue(lib.valueOf(powerObject));
}

function hasPowerReducer(object, boolean, path) {
  return boolean ? boolean : !_.isUndefined(_.get(object, path));
}

function hasPower(object) {
  return _.reduce(
    ['type', 'description', 'default', 'environment', 'include', 'steps', 'value', 'concat'],
    lib.hasPowerReducer(object),
    false
  );
}

function isJavaScriptObject(object) {
  return _.isObject(object) && !_.isArray(object);
}

function isPowerObject(object) {
  return lib.isJavaScriptObject(object) && lib.hasPower(object);
}

function isPlainObject(object) {
  return lib.isJavaScriptObject(object) && !lib.hasPower(object);
}

function isScalar(value) {
  return !lib.isPowerObject(value) && !lib.isPlainObject(value);
}

function convertToConcatMapper(state, item) {
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

function convertToConcat(state, namespace, concat) {
  const content = _.map(concat, lib.convertToConcatMapper(state));
  return lib.processScalarValue(state, namespace, _.compact(content).join('\n'));
}

function processValueKey(state, ns, value, key) {
  const namespace = _.isUndefined(key) ? ns : _.concat(ns, key);
  if (lib.isPowerObject(value)) {
    return lib.processPowerObject(state, namespace, value);
  } else if (lib.isPlainObject(value)) {
    return lib.processObject(state, namespace, value);
  } else {
    return lib.processScalarValue(state, namespace, value);
  }
}

function convertToInclude(state, namespace, fileName) {
  const json = lib._file.parse(fileName);
  return lib.processValueKey(state, namespace, json, undefined);
}

function processPowerObject(state, namespace, powerObject) {
  const fileName = _.get(powerObject, 'include');
  const concat = _.get(powerObject, 'concat');
  if (fileName) {
    return lib.convertToInclude(state, namespace, fileName);
  } else if (concat) {
    return lib.convertToConcat(state, namespace, concat);
  } else {
    return lib.convertToPowerObjects(state, namespace, powerObject);
  }
}

// processObject :: Object -> Object -> Array -> Array
function processObject(state, namespace, object) {
  const mapper = lib.processValueKey(state, namespace);
  return _.flatten(_.map(object, mapper));
}

lib = {
  _file: require('./file'),
  _environment: require('./environment'),

  arrayToPowerObject,
  booleanToPowerObject,
  convertToConcat,
  convertToConcatMapper: _.curry(convertToConcatMapper),
  convertToInclude,
  convertToPowerObjects,
  defaults,
  expandObjectIntoObjects,
  hasPower,
  hasPowerReducer: _.curry(hasPowerReducer),
  input,
  integerToPowerObject,
  isHardCoded,
  isJavaScriptObject,
  isPlainObject,
  isPowerObject,
  isScalar,
  namespace,
  overrideNamespace,
  processObject: _.curry(processObject),
  processPowerObject,
  processScalarValue,
  processValueKey: _.curry(processValueKey),
  removeEnvironment,
  scalarValue,
  stringToPowerObject,
  toObject,
  valueOf,
  valueToScalar
};

module.exports = lib;
