#!/usr/bin/env node

const _ = require('lodash');
const fp = require('lodash/fp');
const program = require('commander');

const parseJsonFile = require('./lib/parseJsonFile');
const parseYamlFile = require('./lib/parseYamlFile');

const fs = require('fs');

function processFile(data) {
  if (data.example.includes('.json')) {
    const json = parseJsonFile(data.example);
    console.log(json);
  } else if (data.example.includes('.yaml') || data.example.includes('.yml')) {
    const json = parseYamlFile(data.example);
    console.log(json);
  }
}

function doesNotContainExampleWord(x) {
  return !_.includes(['example', 'sample'], x);
}

function stripFileName(name) {
  return _.filter(_.split(name, '.'), doesNotContainExampleWord).join('.');
}

function actionHandler() {
  const data = {
    example: program.example,
    environment: program.environment,
    actual: stripFileName(program.example)
  };

  processFile(data);
}

program
  .version('0.0.1')
  .option('-x, --example <example>', 'The example configuration file')
  .option('-e, --environment <environment>', 'The environment like dev, test, prod')
  .action(actionHandler)
  .parse(process.argv);
