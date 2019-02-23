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

function handleScalarValue(value, namespace) {
  return lib.toPowerObjects(lib._power.scalarValue(value), namespace);
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
  const powerObject = lib._pipeline.toObject(object, namespace);
  return lib.expandObjectIntoObjects(powerObject, namespace);
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

function handleUnknownValue(state, namespace, value) {
  if (lib._power.isPowerObject(value)) {
    return lib.handlePowerObject(state, value, namespace);
  } else if (lib._power.isPlainObject(value)) {
    return lib.handlePlainObject(state, value, namespace);
  } else {
    return lib.handleScalarValue(value, namespace);
  }
}

function toIncludeObject(state, namespace, fileName) {
  const json = lib._file.parse(fileName);
  return lib.handleUnknownValue(state, namespace, json);
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

function plainObjectMapper(state, namespace, value, key) {
  const newNamespace = _.concat(namespace, key);
  return lib.handleUnknownValue(state, newNamespace, value);
}

function handlePlainObject(state, object, namespace) {
  return _.flatten(_.map(object, lib.plainObjectMapper(state, namespace)));
}

function echo(x) {
  //  console.log(JSON.stringify(x, null, 2));
  return x;
}

function generate(inState) {
  const state = lib._output.initialize(inState);
  const exampleObject = lib._example.get(state);
  const namespace = [];
  return lib.flow(
    [exampleObject, namespace],
    lib.handlePlainObject(state),
    lib.echo,
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
  _pipeline: require('./pipeline'),
  _power: require('./power'),

  generate,
  plainObjectMapper: _.curry(plainObjectMapper),
  isThereAPreExistingValue,
  extractPreExistingValue,
  promptUserForValue,
  updateInput,
  updateOuput,
  toPowerObjects,
  toIncludeObject,
  toConcatObject,
  toConcatObjectMapper: _.curry(toConcatObjectMapper),
  handlePlainObject: _.curry(handlePlainObject),
  handlePowerObject,
  handleUnknownValue,
  handleScalarValue,
  expandObjectIntoObjects,
  removeEnvironment,
  overrideNamespace,
  echo,
  flow,
  save: _.curry(save),
  getUserInputs: _.curry(getUserInputs),
  removedUnusedEnvironments: _.curry(removedUnusedEnvironments)
};

module.exports = lib;
