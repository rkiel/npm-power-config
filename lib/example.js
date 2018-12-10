const _ = require('lodash');

let lib;

const DEFAULT = 'environment.example.json';

function addFileName(state) {
  const fileName = _.get(state, 'program.example');
  if (_.isUndefined(fileName) || _.isNull(fileName)) {
    _.set(state, 'example.fileName', DEFAULT);
  } else {
    _.set(state, 'example.fileName', fileName);
  }
  return state;
}

function readFile(state) {
  const json = lib._file.parse(_.get(state, 'example.fileName'));
  _.set(state, 'example.json', json);
  return state;
}

function get(state, parts = []) {
  return _.get(state, _.concat(['example', 'json'], parts).join('.'));
}

lib = {
  _file: require('./file'),

  DEFAULT,
  addFileName,
  readFile,
  get
};

module.exports = lib;
