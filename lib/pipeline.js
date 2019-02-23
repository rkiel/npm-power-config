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

function toObject(powerObject, namespace) {
  return _.assign(
    {},
    lib.defaults(),
    lib.namespace(namespace),
    lib.input(powerObject),
    lib._power.valueToScalar(powerObject),
    powerObject
  );
}

lib = {
  _power: require('./power'),

  defaults,
  namespace,
  input,
  toObject
};

module.exports = lib;
