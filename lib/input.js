const _ = require('lodash');
const prompt = require('prompt-sync')({ sigint: true });

let lib;

function addFileName(state) {
  const fileName = _.get(state, 'program.input');
  if (_.isUndefined(fileName) || _.isNull(fileName)) {
    const parts = _.split(_.get(state, 'output.fileName', lib._example.DEFAULT), '/');
    if (parts.length > 1) {
      const last = `.${parts.pop()}`;
      _.set(state, 'input.fileName', _.concat(parts, last).join('/'));
    } else {
      _.set(state, 'input.fileName', `.${parts}`);
    }
  } else {
    _.set(state, 'input.fileName', fileName);
  }
  return state;
}

function readFile(state) {
  const json = lib._file.parse(_.get(state, 'input.fileName'), {});
  _.set(state, 'input.json', json);
  return state;
}

function writeFile(state) {
  const fileName = _.get(state, 'input.fileName');
  const json = _.get(state, 'input.json');
  lib._file.write(fileName, json);
  return state;
}

function promptForAnswer(fullPath, value) {
  console.log('----------');
  if (value.description) {
    console.log();
    console.log('DESCRIPION:', value.description);
  }
  if (value.steps) {
    console.log();
    _.each(value.steps, (step, index) => console.log(`STEP ${index + 1}. `, step));
  }
  console.log();
  console.log('TYPE:', value.type || 'string');
  console.log();
  return prompt(`${fullPath.join(' -> ')} : `);
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

lib = {
  _file: require('./file'),
  _example: require('./example'),

  addFileName,
  readFile,
  writeFile,
  promptForAnswer,
  convertType
};

module.exports = lib;
