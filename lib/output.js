const _ = require('lodash');

let lib;

function addFileName(state) {
  const fileName = _.get(state, 'program.output');
  if (_.isUndefined(fileName) || _.isNull(fileName)) {
    const parts = _.split(_.get(state, 'example.fileName', lib._example.DEFAULT), '.');
    const doesNotContainExampleWord = x => !_.includes(['example', 'sample'], x);
    const lessParts = _.filter(parts, doesNotContainExampleWord);
    _.set(state, 'output.fileName', lessParts.join('.'));
  } else {
    _.set(state, 'output.fileName', fileName);
  }
  return state;
}

function writeFile(state) {
  const fileName = _.get(state, 'output.fileName');
  const json = _.get(state, 'output.json');
  lib._file.write(fileName, json);
  return state;
}

function anything(state, fullPath, value) {
  const inputValue = _.get(state, _.concat(['input', 'json'], fullPath).join('.'));
  if (_.isUndefined(inputValue) || _.isNull(inputValue)) {
    const answer = lib._input.promptForAnswer(fullPath, value);
    return lib._input.convertType(value, answer);
  } else {
    return inputValue;
  }
}

function something(state, path, value, key) {
  if (_.isObject(value) && value._path_) {
    const json = _.get(state, _.concat([], 'example.json', path, key));
    _.each(lib._environment.limitScope(state, json), lib.something(state, _.concat(path, key)));
  } else if (key !== '_path_') {
    const fullPath = _.concat(path, key);
    let newValue;
    if (!_.isUndefined(value.value) && !_.isNull(value.value)) {
      newValue = value.value;
    } else {
      newValue = lib.anything(state, fullPath, value);
    }
    _.set(state, _.concat(['output', 'json'], fullPath).join('.'), newValue);
    _.set(state, _.concat(['input', 'json'], fullPath).join('.'), newValue);
  }
}

function generate(state) {
  _.set(state, 'output.json', {});
  const json = _.get(state, 'example.json', {});
  _.each(lib._environment.limitScope(state, json), lib.something(state, []));
  return state;
}

lib = {
  _file: require('./file'),
  _environment: require('./environment'),
  _input: require('./input'),
  _example: require('./example'),

  addFileName,
  writeFile,
  generate,
  something: _.curry(something),
  anything
};

module.exports = lib;
