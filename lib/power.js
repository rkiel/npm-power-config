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

lib = {
  arrayToPowerObject,
  booleanToPowerObject,
  defaults,
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
  scalarValue,
  stringToPowerObject,
  toObject,
  valueOf,
  valueToScalar
};

module.exports = lib;
