const _ = require('lodash');

let lib;

function promptUserForValue(state, namespace, object) {
  const answer = lib._input.promptForAnswer(namespace, object);
  return lib._input.convertType(object, answer);
}

// function isNamespaceObject(json) {
//   return (
//     // reserved words
//     _.isUndefined(json.description) &&
//     _.isUndefined(json.default) &&
//     _.isUndefined(json.steps) &&
//     _.isUndefined(json.value) &&
//     _.isUndefined(json.type) &&
//     _.isUndefined(json.environment) &&
//     _.isUndefined(json.include)
//   );
// }

// function isHardCodedValueObject(json) {
//   const value = _.get(json, 'value');
//   return !_.isUndefined(value) && !_.isNull(value);
// }

// function extractHardCodedValue(json) {
//   return _.get(json, 'value');
// }

// function isIncludeFileObject(json) {
//   const value = _.get(json, 'include');
//   return !_.isUndefined(value) && !_.isNull(value);
// }

function extractIncludeFile(json) {
  return lib._file.parse(_.get(json, 'include'));
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

function updateInput(state, namespace, value) {
  lib._input.set(state, namespace, value);
}

// function calculateValue(state, namespace, object) {
//   if (lib.isHardCodedValueObject(object)) {
//     return lib.extractHardCodedValue(object);
//   } else if (lib.isIncludeFileObject(object)) {
//     return lib.extractIncludeFile(object);
//   } else if (lib.isThereAPreExistingValue(state, namespace)) {
//     return lib.extractPreExistingValue(state, namespace);
//   } else {
//     return lib.promptUserForValue(state, namespace, object);
//   }
// }

// function updateValues(state, inNamespace, object, key) {
//   const namespace = _.concat(inNamespace, key); // immutable critical for recursion
//   const value = lib.calculateValue(state, namespace, object);
//
//   lib.updateOuput(state, namespace, value);
//   lib.updateInput(state, namespace, value);
//   return state;
// }

// function processDataFieldObject(state, namespace, object, key) {
//   if (lib._environment.shouldIgnore(state, object)) {
//     return state;
//   } else {
//     return lib.updateValues(state, namespace, object, key);
//   }
// }

function save(state, list) {
  return _.each(list, item => {
    lib.updateOuput(state, item.namespace, item.value);
    if (item.input === 'user') {
      lib.updateInput(state, item.namespace, item.value);
    }
  });
}

function getIncludeFiles(state, list) {
  return _.map(list, item => {
    if (_.isUndefined(item.include)) {
      return item;
    } else {
      const value = lib.extractIncludeFile(json);
      return _.assign({}, item, { value });
    }
  });
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
function removedUnuseEnvironments(state, list) {
  return _.filter(list, item => lib._environment.isPartOf(state, item.namespace));
}

function processList(state) {
  const list = _.get(state, 'transform.list');
  return _.flow([
    lib.removedUnuseEnvironments(state),
    lib.getUserInputs(state),
    lib.getIncludeFiles(state),
    lib.save(state)
  ])(list);
}

// function processNamespaceObject(state, inNamespace, namespaceObject, key) {
//   const namespace = _.concat(inNamespace, key); // immutable critical for recursion
//   return lib.processObject(state, namespaceObject, namespace);
// }

function powerString(value) {
  return { type: 'string', value };
}

function powerInteger(value) {
  return { type: 'integer', value };
}

function powerBoolean(value) {
  return { type: 'boolean', value };
}

function powerArray(value) {
  return { type: 'array', value };
}

function powerNamespace(namespace) {
  return { namespace };
}

function powerDefaults() {
  return { type: 'string' };
}

function powerInput(object) {
  return { input: _.isUndefined(_.get(object, 'value')) ? 'user' : 'hardCoded' };
}

function processScalar(state, value, namespace) {
  if (_.isString(value)) {
    lib.processPowerObject(state, lib.powerString(value), namespace);
  } else if (_.isNumber(value)) {
    lib.processPowerObject(state, lib.powerInteger(value), namespace);
  } else if (_.isBoolean(value)) {
    lib.processPowerObject(state, lib.powerBoolean(value), namespace);
  } else if (_.isArray(value)) {
    lib.processPowerObject(state, lib.powerArray(value), namespace);
  } else {
    throw `unknown scalar: ${value}`;
  }
}

function processPowerObject(state, object, namespace) {
  const powerObject = _.assign({}, lib.powerDefaults(), lib.powerNamespace(namespace), lib.powerInput(object), object);
  _.get(state, 'transform.list').push(powerObject);
}

function isPowerObjectReducer(object, boolean, path) {
  return boolean ? boolean : _.get(object, path);
}

function isPowerObject(object) {
  return _.reduce(
    ['type', 'description', 'default', 'environment', 'include', 'steps', 'value'],
    lib.isPowerObjectReducer(object),
    false
  );
}

function objectIterator(state, namespace, value, key) {
  // if (lib.isNamespaceObject(value)) {
  //   return lib.processNamespaceObject(state, namespace, value, key);
  // } else {
  //   return lib.processDataFieldObject(state, namespace, value, key);
  // }
  const newNamespace = _.concat(namespace, key);
  if (_.isArray(value)) {
    lib.processScalar(state, value, newNamespace);
  } else if (_.isObject(value)) {
    if (lib.isPowerObject(value)) {
      lib.processPowerObject(state, value, newNamespace);
    } else {
      lib.processObject(state, value, newNamespace);
    }
  } else {
    lib.processScalar(state, value, newNamespace);
  }
}

function processObject(state, inExampleJson, namespace) {
  // const exampleJson = lib._environment.limitScope(state, inExampleJson);
  return _.each(inExampleJson, lib.objectIterator(state, namespace));
}

function generate(inState) {
  const state = lib._output.initialize(inState);
  const exampleJson = lib._example.get(state);
  const namespace = [];
  _.set(state, 'transform.list', []);
  lib.processObject(state, exampleJson, namespace);
  // console.log('*********');
  // console.log(JSON.stringify(_.get(state, 'transform.list'), null, 2));
  const list = lib.processList(state);
  // console.log('*********');
  // console.log(JSON.stringify(list, null, 2));
  // console.log('*********');
  // console.log(JSON.stringify(state, null, 2));
  return state;
}

lib = {
  _file: require('./file'),
  _environment: require('./environment'),
  _input: require('./input'),
  _output: require('./output'),
  _example: require('./example'),

  generate,
  objectIterator: _.curry(objectIterator),
  //isNamespaceObject,
  //isHardCodedValueObject,
  //extractHardCodedValue,
  //isIncludeFileObject,
  extractIncludeFile,
  isThereAPreExistingValue,
  extractPreExistingValue,
  promptUserForValue,
  updateInput,
  updateOuput,
  //updateValues,
  //calculateValue,
  //processNamespaceObject,
  //processDataFieldObject,
  powerInput,
  isPowerObject,
  processPowerObject,
  processObject,
  processScalar,
  powerDefaults,
  powerNamespace,
  powerString,
  powerInteger,
  powerBoolean,
  powerArray,
  processList,
  save: _.curry(save),
  getUserInputs: _.curry(getUserInputs),
  getIncludeFiles: _.curry(getIncludeFiles),
  isPowerObjectReducer: _.curry(isPowerObjectReducer),
  removedUnuseEnvironments: _.curry(removedUnuseEnvironments)
};

module.exports = lib;
