const _ = require('lodash');

let lib;

// find and set the first exising rc file
// searchForFileName :: Object -> Object
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

// read, parse, and set the contents of the rc file
// readFile :: Object -> Object
function readFile(state) {
  const fileName = _.get(state, 'rc.fileName');
  if (fileName) {
    _.set(state, 'rc.json', lib._file.parse(fileName));
  } else {
    _.set(state, 'rc.json', {});
  }
  return state;
}

// define the set of environment names based on either the rc file contents or
//   a hard-coded default
// addEnvironment :: Object -> Object
function addEnvironments(state) {
  return lib._environment.addEnvironments(
    _.get(state, 'rc.json.environments', ['local', 'dev', 'test', 'prod']),
    state
  );
}

lib = {
  _environment: require('./environment'),
  _file: require('./file'),
  searchForFileName,
  readFile,
  addEnvironments
};

module.exports = lib;
