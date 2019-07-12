#!/usr/bin/env node

const _ = require("lodash");
const program = require("commander");

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
      lib._transform.generate,
      lib._input.writeFile,
      lib._output.writeFile
    ];
    _.flow(f)({
      program: _.pick(p, [
        "input",
        "output",
        "example",
        "environment",
        "flatten",
        "clear",
        "userInputs",
        "review",
        "pattern"
      ])
    });
  };
}

lib = {
  _rc: require("./lib/rc"),
  _environment: require("./lib/environment"),
  _example: require("./lib/example"),
  _output: require("./lib/output"),
  _input: require("./lib/input"),
  _transform: require("./lib/transform"),
  actionHandler
};

program
  .version("0.2.0")
  .option("-i, --input <input>", "input configuration file")
  .option("-o, --output <output>", "output configuration file")
  .option(
    "-x, --example <example>",
    `example configuration file. Default is ${lib._example.DEFAULT}`
  )
  .option(
    "-e, --environment <environment>",
    "environment such as dev, test, or prod"
  )
  .option("-f, --flatten", "flatten nested environment")
  .option(
    "-C, --clear <clear>",
    "path(s) to input value(s) to clear and/or set"
  )
  .option("-U, --no-user-inputs", "exit with failure if user input is required")
  .option("-R, --review", "review all user inputs")
  .option("-P, --pattern <pattern>", "review user inputs that match pattern")
  .action(lib.actionHandler(program))
  .parse(process.argv);
