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

function toPowerObjects(object, namespace) {
  const powerObject = lib.toObject(object, namespace);
  return lib.expandObjectIntoObjects(powerObject, namespace);
}

function handleScalarValue(value, namespace) {
  return lib.toPowerObjects(lib.scalarValue(value), namespace);
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
  return lib.handleScalarValue(_.compact(content).join('\n'), namespace);
}

function handleUnknownValue(state, namespace, value) {
  if (lib.isPowerObject(value)) {
    return lib.handlePowerObject(state, value, namespace);
  } else if (lib.isPlainObject(value)) {
    return lib.processObject(state, value, namespace);
  } else {
    return lib.handleScalarValue(value, namespace);
  }
}

function toIncludeObject(state, namespace, fileName) {
  const json = lib._file.parse(fileName);
  return lib.handleUnknownValue(state, namespace, json);
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

function processObjectMapper(state, namespace, value, key) {
  const newNamespace = _.concat(namespace, key);
  return lib.handleUnknownValue(state, newNamespace, value);
}

function processObject(state, object, namespace) {
  const mapper = lib.processObjectMapper(state, namespace);
  return _.flatten(_.map(object, mapper));
}

lib = {
  _file: require('./file'),
  _environment: require('./environment'),

  arrayToPowerObject,
  booleanToPowerObject,
  defaults,
  toIncludeObject,
  handleUnknownValue,
  expandObjectIntoObjects,
  handleScalarValue,
  hasPower,
  processObjectMapper: _.curry(processObjectMapper),
  hasPowerReducer: _.curry(hasPowerReducer),
  toConcatObjectMapper: _.curry(toConcatObjectMapper),
  processObject: _.curry(processObject),
  input,
  integerToPowerObject,
  isHardCoded,
  handlePowerObject,
  isJavaScriptObject,
  isPlainObject,
  isPowerObject,
  isScalar,
  namespace,
  overrideNamespace,
  removeEnvironment,
  scalarValue,
  stringToPowerObject,
  toObject,
  toPowerObjects,
  valueOf,
  valueToScalar
};

module.exports = lib;
