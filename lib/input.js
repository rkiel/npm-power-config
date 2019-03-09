const _ = require('lodash');
const prompt = require('prompt-sync')({ sigint: true });

let lib;

function _something(name) {
  const parts = _.split(name, '.');
  return _.map(parts, p => (p === 'example' || p === 'sample' ? 'inputs' : p)).join('.');
}

function addFileName(state) {
  const fileName = _.get(state, 'program.input');
  if (_.isUndefined(fileName) || _.isNull(fileName)) {
    const parts = _.split(_.get(state, 'example.fileName', lib._example.DEFAULT), '/');
    // output fileName has a slash in the name
    if (parts.length > 1) {
      const last = parts.pop();
      _.set(state, 'input.fileName', _.concat(parts, lib._something(last)).join('/'));
    } else {
      _.set(state, 'input.fileName', lib._something(parts));
    }
  } else {
    _.set(state, 'input.fileName', fileName);
  }
  return state;
}

function readFile(state) {
  const json = lib._file.parse(_.get(state, 'input.fileName'), {});
  const path = _.get(state, 'program.clear');
  if (!_.isUndefined(path)) {
    _.set(json, path, undefined);
  }
  _.set(state, 'input.json', json);
  return state;
}

function writeFile(state) {
  const fileName = _.get(state, 'input.fileName');
  const json = _.get(state, 'input.json');
  lib._file.write(fileName, json);
  return state;
}

function _displayStepsIterator(spacer, step, index) {
  if (_.isArray(step)) {
    lib._displaySteps(step, spacer + '    ');
  } else {
    console.log(`${spacer}- ${step}`);
  }
}

function _displaySteps(steps, spacer = '') {
  _.each(steps, lib._displayStepsIterator(spacer));
}

function promptForAnswer(fullPath, value) {
  console.log('----------');
  if (value.description) {
    console.log();
    console.log('DESCRIPTION:', value.description);
  }
  if (value.steps) {
    console.log();
    lib._displaySteps(value.steps);
  }
  console.log();
  console.log('TYPE:', value.type || 'string');
  console.log();

  const msg = [fullPath.join('.')];
  const defaultValue = _.get(value, 'default');
  if (!_.isUndefined(defaultValue)) {
    msg.push(`[ ${defaultValue} ]`);
  }
  msg.push(':');
  msg.push('');
  return prompt(msg.join(' '), defaultValue);
}

function convertType(value, answer) {
  switch (value.type) {
    case 'boolean':
      return _.includes(['yes', 'true'], answer);
    case 'integer':
      return parseInt(answer, 10);
    default:
      return answer;
  }
}

function get(state, parts) {
  //  return _.get(state, _.concat(['input', 'json'], lib._environment.expand(state, parts)).join('.'));
  return _.get(state, _.concat(['input', 'json'], parts).join('.'));
}

function set(state, parts, value) {
  return _.set(state, _.concat(['input', 'json'], lib._environment.expand(state, parts)).join('.'), value);
}

lib = {
  _file: require('./file'),
  _example: require('./example'),
  _environment: require('./environment'),

  _displayStepsIterator: _.curry(_displayStepsIterator),
  _displaySteps,
  _something,
  addFileName,
  readFile,
  writeFile,
  promptForAnswer,
  convertType,
  get,
  set
};

module.exports = lib;
