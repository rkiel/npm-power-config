#!/usr/bin/env node

const _ = require('lodash');
const fp = require('lodash/fp');
const program = require('commander');

const parseJsonFile = require('./lib/parseJsonFile');
const writeJsonFile = require('./lib/writeJsonFile');
const parseYamlFile = require('./lib/parseYamlFile');
const writeYamlFile = require('./lib/writeYamlFile');

const fs = require('fs');

function addCommandLineArguments(data) {
  data.exampleFileName = program.example;
  data.environment = program.environment;
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

function addActualFileName(data) {
  const parts = _.split(data.exampleFileName, '.');
  const doesNotContainExampleWord = x => !_.includes(['example', 'sample'], x);
  const lessParts = _.filter(parts, doesNotContainExampleWord);
  data.actualFileName = lessParts.join('.');
  return data;
}

function readExampleFile(data) {
  switch (data.format) {
    case 'json':
      data.json = parseJsonFile(data.exampleFileName);
      break;
    case 'yaml':
      data.json = parseYamlFile(data.exampleFileName);
      break;
    default:
      data.json = {};
  }
  return data;
}

function generateOutput(data) {
  data.output = data.json;
  return data;
}

function writeActualFile(data) {
  switch (data.format) {
    case 'json':
      writeJsonFile(data.actualFileName, data.output);
      break;
    case 'yaml':
      writeYamlFile(data.actualFileName, data.output);
      break;
  }
  return data;
}

function actionHandler() {
  const f = [
    addCommandLineArguments,
    addActualFileName,
    addFileFormat,
    readExampleFile,
    generateOutput,
    writeActualFile
  ];
  _.flow(f)({});
}

program
  .version('0.0.1')
  .option('-x, --example <example>', 'The example configuration file')
  .option('-e, --environment <environment>', 'The environment like dev, test, prod')
  .action(actionHandler)
  .parse(process.argv);
