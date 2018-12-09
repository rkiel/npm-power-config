#!/usr/bin/env node

const _ = require('lodash');
const program = require('commander');

function actionHandler(p) {
  return function() {
    const f = [
      lib._rc.searchForFileName,
      lib._rc.readFile,
      lib._rc.addEnvironments,
      lib._environment.addEnvironment,
      lib._example.addFileName,
      lib._output.addFileName,
      lib._input.addFileName,
      lib._example.readFile,
      lib._input.readFile,
      lib._output.generate,
      lib._input.writeFile,
      lib._output.writeFile
    ];
    _.flow(f)({ program: p });
  };
}

lib = {
  _rc: require('./lib/rc'),
  _environment: require('./lib/environment'),
  _example: require('./lib/example'),
  _output: require('./lib/output'),
  _input: require('./lib/input'),
  actionHandler
};

program
  .version('0.0.1')
  .option('-i, --input <input>', 'input configuration file')
  .option('-o, --output <output>', 'output configuration file')
  .option('-x, --example <example>', `example configuration file. Default is ${lib._example.DEFAULT}`)
  .option('-e, --environment <environment>', 'environment such as dev, test, or prod')
  .action(lib.actionHandler(program))
  .parse(process.argv);
