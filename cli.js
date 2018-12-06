#!/usr/bin/env node

const _ = require('lodash');
const fp = require('lodash/fp');
const program = require('commander');

function actionHandler() {
  const actual = _.filter(_.split(program.example, '.'), x => x !== 'example').join('.');
  console.log(program.example, actual);
}

program
  .version('0.0.1')
  .option('-e, --example <example>', 'The example')
  .action(actionHandler)
  .parse(process.argv);
