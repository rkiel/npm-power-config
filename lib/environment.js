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
  return _.omit(json, _.get(state, 'environments.unused', []));
}

function shouldIgnore(state, object) {
  const scope = _.get(state, 'environments.scope');
  const environment = _.get(object, 'environment');
  if (_.isUndefined(scope) || _.isNull(scope)) {
    return false;
  } else if (_.isUndefined(environment) || _.isNull(environment)) {
    return false;
  } else if (_.isArray(environment)) {
    return !_.includes(environment, scope);
  } else if (_.isString(environment)) {
    return environment !== scope;
  } else {
    return false;
  }
}

lib = {
  limitScope,
  addEnvironment,
  shouldIgnore
};

module.exports = lib;
