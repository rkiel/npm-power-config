const _ = require('lodash');

let lib;

function addEnvironment(state) {
  const environment = _.get(state, 'program.environment');
  const flatten = _.get(state, 'program.flatten', false);
  if (_.isUndefined(environment)) {
    _.set(state, 'environments.unused', []);
  } else {
    _.set(state, 'environments.scope', environment);
    _.set(state, 'environments.unused', _.without(_.get(state, 'environments.defined', []), environment));
  }
  _.set(state, 'environments.flatten', flatten);
  return state;
}

function limitScope(state, json) {
  return _.omit(json, _.get(state, 'environments.unused', []));
}

function flatten(state, parts) {
  const shouldFlatten = _.get(state, 'environments.flatten');
  const scope = _.get(state, 'environments.scope');
  if (_.isUndefined(scope) || _.isNull(scope)) {
    return parts;
  } else if (shouldFlatten) {
    return _.without(parts, scope);
  } else {
    return parts;
  }
}

function expand(state, parts) {
  const scope = _.get(state, 'environments.scope');
  if (_.isUndefined(scope) || _.isNull(scope)) {
    return parts;
  } else {
    const example = lib._example.get(state, parts);
    const environment = _.get(example, 'environment');
    if (_.isUndefined(environment) || _.isNull(environment)) {
      return parts;
    } else if (_.isString(environment) && environment == scope) {
      return _.concat(parts, scope);
    } else if (_.isArray(environment) && _.includes(environment, scope)) {
      return _.concat(parts, scope);
    } else {
      return parts;
    }
  }
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
  _example: require('./example'),

  limitScope,
  addEnvironment,
  shouldIgnore,
  flatten,
  expand
};

module.exports = lib;
