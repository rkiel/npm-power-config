const _ = require('lodash');

let lib;

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

lib = {
  valueOf,
  isHardCoded
};

module.exports = lib;
