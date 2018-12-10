const _ = require('lodash');

let lib;

function searchForFileName(state) {
  const fileName = lib._file.search([
    './.power-config.json',
    './.power-config.yml',
    './.power-config.yaml',
    `${process.env.HOME}/.power-config.json`,
    `${process.env.HOME}/.power-config.yml`,
    `${process.env.HOME}/.power-config.yaml`
  ]);
  if (fileName) {
    _.set(state, 'rc.fileName', fileName);
  }
  return state;
}

function readFile(state) {
  const fileName = _.get(state, 'rc.fileName');
  if (fileName) {
    _.set(state, 'rc.json', lib._file.parse(fileName));
  } else {
    _.set(state, 'rc.json', {});
  }
  return state;
}

function addEnvironments(state) {
  _.set(state, 'environments.defined', _.get(state, 'rc.json.environments', ['local', 'dev', 'test', 'prod']));
  return state;
}

lib = {
  _file: require('./file'),
  searchForFileName,
  readFile,
  addEnvironments
};

module.exports = lib;
