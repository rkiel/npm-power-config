#!/usr/bin/env node

const _ = require('lodash');
const fp = require('lodash/fp');
const program = require('commander');
const prompt = require('prompt-sync')({ sigint: true });

const parseJsonFile = require('./lib/parseJsonFile');
const writeJsonFile = require('./lib/writeJsonFile');
const parseYamlFile = require('./lib/parseYamlFile');
const writeYamlFile = require('./lib/writeYamlFile');

const fs = require('fs');

let lib;

const DEFAULT_EXAMPLE = 'environment.example.json';

function addEnvironment(data) {
  const environment = _.get(data, 'program.environment');
  if (_.isUndefined(environment)) {
    data.unusedEnvironments = [];
  } else {
    data.environment = environment;
    data.unusedEnvironments = _.without(data.environments, environment);
  }
  return data;
}

function addExampleFileName(data) {
  const exampleFileName = _.get(data, 'program.example');
  if (_.isUndefined(exampleFileName) || _.isNull(exampleFileName)) {
    data.exampleFileName = DEFAULT_EXAMPLE;
  } else {
    data.exampleFileName = exampleFileName;
  }
  return data;
}

function addOutputFileName(data) {
  const outputFileName = _.get(data, 'program.output');
  if (_.isUndefined(outputFileName) || _.isNull(outputFileName)) {
    const parts = _.split(data.exampleFileName, '.');
    const doesNotContainExampleWord = x => !_.includes(['example', 'sample'], x);
    const lessParts = _.filter(parts, doesNotContainExampleWord);
    data.outputFileName = lessParts.join('.');
  } else {
    data.outputFileName = outputFileName;
  }
  return data;
}

function addInputFileName(data) {
  const inputFileName = _.get(data, 'program.input');
  if (_.isUndefined(inputFileName) || _.isNull(inputFileName)) {
    const parts = _.split(data.outputFileName, '/');
    if (parts.length > 1) {
      const last = `.${parts.pop()}`;
      data.inputFileName = _.concat(parts, last).join('/');
    } else {
      data.inputFileName = `.${parts}`;
    }
  } else {
    data.inputFileName = inputFileName;
  }
  return data;
}

function addFileFormat(data) {
  if (data.exampleFileName.includes('.json')) {
    data.format = 'json';
  } else if (data.exampleFileName.includes('.yaml') || data.exampleFileName.includes('.yml')) {
    data.format = 'yaml';
  } else {
    data.format = 'unknown';
  }
  return data;
}

function readInitializeFile(data) {
  const searchFor = [
    './.power-config.json',
    './.power-config.yml',
    './.power-config.yaml',
    `${process.env.HOME}/.power-config.json`,
    `${process.env.HOME}/.power-config.yml`,
    `${process.env.HOME}/.power-config.yaml`
  ];
  const fileName = _.reduce(searchFor, (a, e) => (a !== false ? a : fs.existsSync(e) ? e : false), false);
  if (fileName !== false && fileName.includes('.json')) {
    data.rc = parseJsonFile(fileName);
  } else if (fileName !== false && fileName.includes('.yml')) {
    data.rc = parseYamlFile(fileName);
  } else if (fileName !== false && fileName.includes('.yaml')) {
    data.rc = parseYamlFile(fileName);
  }
  return data;
}

function addEnvironments(data) {
  data.environments = _.get(data, 'rc.environments', ['local', 'dev', 'test', 'prod']);
  return data;
}

function readExampleFile(data) {
  switch (data.format) {
    case 'json':
      data.exampleJson = parseJsonFile(data.exampleFileName);
      break;
    case 'yaml':
      data.exampleJson = parseYamlFile(data.exampleFileName);
      break;
    default:
      data.exampleJson = {};
  }
  return data;
}

function readInputFile(data) {
  if (fs.existsSync(data.inputFileName)) {
    switch (data.format) {
      case 'json':
        data.inputJson = parseJsonFile(data.inputFileName);
        break;
      case 'yaml':
        data.inputJson = parseYamlFile(data.inputFileName);
        break;
      default:
        data.inputJson = {};
    }
  } else {
    data.inputJson = {};
  }
  return data;
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

function anything(data, fullPath, value) {
  const inputValue = _.get(data.inputJson, fullPath.join('.'));
  if (_.isUndefined(inputValue) || _.isNull(inputValue)) {
    const answer = lib.promptForAnswer(fullPath, value);
    return lib.convertType(value, answer);
  } else {
    return inputValue;
  }
}

function something(data, path, value, key) {
  if (_.isObject(value) && value._path_) {
    const json = _.get(data, _.concat([], 'exampleJson', path, key));
    _.each(lib.limitScopeToEnvironment(data, json), lib.something(data, _.concat(path, key)));
  } else if (key !== '_path_') {
    const fullPath = _.concat(path, key);
    let newValue;
    if (!_.isUndefined(value.value) && !_.isNull(value.value)) {
      newValue = value.value;
    } else {
      newValue = lib.anything(data, fullPath, value);
    }
    _.set(data.outputJson, fullPath.join('.'), newValue);
    _.set(data.inputJson, fullPath.join('.'), newValue);
  }
}

function limitScopeToEnvironment(data, json) {
  if (data.environment) {
    const keys = _.keys(json);
    if (_.includes(keys, data.environment)) {
      return _.pick(json, [data.environment]);
    } else {
      return json;
    }
  } else {
    return json;
  }
}

function generateOutput(data) {
  data.outputJson = {};
  const json = _.get(data, 'exampleJson');
  _.each(lib.limitScopeToEnvironment(data, json), lib.something(data, []));
  return data;
}

function writeOutputFile(data) {
  switch (data.format) {
    case 'json':
      writeJsonFile(data.outputFileName, data.outputJson);
      break;
    case 'yaml':
      writeYamlFile(data.outputFileName, data.outputJson);
      break;
  }
  return data;
}

function writeInputFile(data) {
  switch (data.format) {
    case 'json':
      writeJsonFile(data.inputFileName, data.inputJson);
      break;
    case 'yaml':
      writeYamlFile(data.inputFileName, data.inputJson);
      break;
  }
  return data;
}

function actionHandler(p) {
  return function() {
    const f = [
      lib.readInitializeFile,
      lib.addEnvironments,
      lib.addEnvironment,
      lib.addExampleFileName,
      lib.addOutputFileName,
      lib.addInputFileName,
      lib.addFileFormat,
      lib.readExampleFile,
      lib.readInputFile,
      lib.generateOutput,
      lib.writeInputFile,
      lib.writeOutputFile
    ];
    _.flow(f)({ program: p });
  };
}

lib = {
  readInitializeFile,
  addEnvironment,
  addEnvironments,
  addExampleFileName,
  addOutputFileName,
  addInputFileName,
  addFileFormat,
  readExampleFile,
  readInputFile,
  generateOutput,
  limitScopeToEnvironment,
  something: _.curry(something),
  anything,
  convertType,
  promptForAnswer,
  actionHandler,
  writeInputFile,
  writeOutputFile
};

program
  .version('0.0.1')
  .option('-i, --input <input>', 'input configuration file')
  .option('-o, --output <output>', 'output configuration file')
  .option('-x, --example <example>', `example configuration file. Default is ${DEFAULT_EXAMPLE}`)
  .option('-e, --environment <environment>', 'environment such as dev, test, or prod')
  .action(lib.actionHandler(program))
  .parse(process.argv);
