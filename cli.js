#!/usr/bin/env node

const _ = require('lodash');
const fp = require('lodash/fp');
const program = require('commander');

function doesNotContainExampleWord(x) {
  return !_.includes(['example', 'sample'], x);
}

function stripFileName(name) {
  return _.filter(_.split(name, '.'), doesNotContainExampleWord).join('.');
}

function actionHandler() {
  const actual = stripFileName(program.example);
  console.log(program.example, actual);
}

program
  .version('0.0.1')
  .option('-e, --example <example>', 'The example')
  .action(actionHandler)
  .parse(process.argv);
