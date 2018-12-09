const _ = require('lodash');

let lib;

function addEnvironment(state) {
  const environment = _.get(state, 'program.environment');
  if (_.isUndefined(environment)) {
    _.set(state, 'environments.unused', []);
  } else {
    _.set(state, 'environments.scope', environment);
    _.set(state, 'environments.unused', _.without(_.get(state, 'environments.defined', []), environment));
  }
  return state;
}

function limitScope(state, json) {
  return _.without(json, _.get(state, 'environments.unused', []));
}

lib = {
  limitScope,
  addEnvironment
};

module.exports = lib;
