#!/usr/bin/env node

const _ = require('lodash');
const fp = require('lodash/fp');
const program = require('commander');

const parseJsonFile = require('./lib/parseJsonFile');
const writeJsonFile = require('./lib/writeJsonFile');
const parseYamlFile = require('./lib/parseYamlFile');
const writeYamlFile = require('./lib/writeYamlFile');

const fs = require('fs');

function addArguments(data) {
  data.example = program.example;
  data.environment = program.environment;
  return data;
}

function addFormat(data) {
  if (data.example.includes('.json')) {
    data.format = 'json';
  } else if (data.example.includes('.yaml') || data.example.includes('.yml')) {
    data.format = 'yaml';
  } else {
    data.format = 'unknown';
  }
  return data;
}

function addActual(data) {
  const parts = _.split(data.example, '.');
  const doesNotContainExampleWord = x => !_.includes(['example', 'sample'], x);
  const lessParts = _.filter(parts, doesNotContainExampleWord);
  data.actual = lessParts.join('.');
  return data;
}

function processFile(data) {
  switch (data.format) {
    case 'json':
      json = parseJsonFile(data.example);
      writeJsonFile(data.actual, json);
      break;
    case 'yaml':
      json = parseYamlFile(data.example);
      writeYamlFile(data.actual, json);
      break;
    default:
      json = {};
  }
  console.log(json);
}

function actionHandler() {
  const data = _.flow(addArguments, addActual, addFormat)({});

  processFile(data);
}

program
  .version('0.0.1')
  .option('-x, --example <example>', 'The example configuration file')
  .option('-e, --environment <environment>', 'The environment like dev, test, prod')
  .action(actionHandler)
  .parse(process.argv);
