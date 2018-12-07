#!/usr/bin/env node

const _ = require('lodash');
const fp = require('lodash/fp');
const program = require('commander');

const parseJsonFile = require('./lib/parseJsonFile');
const writeJsonFile = require('./lib/writeJsonFile');
const parseYamlFile = require('./lib/parseYamlFile');
const writeYamlFile = require('./lib/writeYamlFile');

const fs = require('fs');

function addEnvironment(data) {
  const environment = _.get(data, 'program.environment');
  if (!_.isUndefined(environment)) {
    data.environment = environment;
  }
  return data;
}

function addExampleFileName(data) {
  data.exampleFileName = _.get(data, 'program.example');
  return data;
}

function addActualFileName(data) {
  const parts = _.split(data.exampleFileName, '.');
  const doesNotContainExampleWord = x => !_.includes(['example', 'sample'], x);
  const lessParts = _.filter(parts, doesNotContainExampleWord);
  data.actualFileName = lessParts.join('.');
  return data;
}

function addPersonalFileName(data) {
  data.personalFileName = `.${data.actualFileName}`;
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

function readPersonalFile(data) {
  if (fs.existsSync(data.personalFileName)) {
    switch (data.format) {
      case 'json':
        data.personalJson = parseJsonFile(data.personalFileName);
        break;
      case 'yaml':
        data.personalJson = parseYamlFile(data.personalFileName);
        break;
      default:
        data.personalJson = {};
    }
  } else {
    data.personalJson = {};
  }
  return data;
}

function generateOutput(data) {
  data.actualJson = data.exampleJson;
  return data;
}

function writeActualFile(data) {
  switch (data.format) {
    case 'json':
      writeJsonFile(data.actualFileName, data.actualJson);
      break;
    case 'yaml':
      writeYamlFile(data.actualFileName, data.actualJson);
      break;
  }
  return data;
}

function writePersonalFile(data) {
  switch (data.format) {
    case 'json':
      writeJsonFile(data.personalFileName, data.personalJson);
      break;
    case 'yaml':
      writeYamlFile(data.personalFileName, data.personalJson);
      break;
  }
  return data;
}

function actionHandler(p) {
  return function() {
    const f = [
      addEnvironment,
      addExampleFileName,
      addActualFileName,
      addPersonalFileName,
      addFileFormat,
      readExampleFile,
      readPersonalFile,
      generateOutput,
      writePersonalFile,
      writeActualFile
    ];
    _.flow(f)({ program: p });
  };
}

program
  .version('0.0.1')
  .option('-x, --example <example>', 'The example configuration file')
  .option('-e, --environment <environment>', 'The environment like dev, test, prod')
  .action(actionHandler(program))
  .parse(process.argv);
