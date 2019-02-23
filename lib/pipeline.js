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
  if (lib._power.isHardCoded(powerObject)) {
    input = 'hardCoded';
  } else {
    input = 'user';
  }
  return { input };
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

function toObject(powerObject, namespace) {
  return _.assign(
    {},
    lib.defaults(),
    lib.namespace(namespace),
    lib.input(powerObject),
    lib.scalarValue(lib._power.valueOf(powerObject)),
    powerObject
  );
}

lib = {
  _power: require('./power'),

  defaults,
  namespace,
  input,
  scalarValue,
  arrayToPowerObject,
  booleanToPowerObject,
  integerToPowerObject,
  stringToPowerObject,
  toObject
};

module.exports = lib;
