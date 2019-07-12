const _ = require("lodash");

let lib;

function promptUserForValue(state, namespace, object) {
  const answer = lib._input.promptForAnswer(namespace, object);
  return lib._input.convertType(object, answer);
}

// TODO: check for value based on 'environment' field too
function isThereAPreExistingValue(state, namespace) {
  const inputValue = lib._input.get(state, namespace);
  return !_.isUndefined(inputValue) && !_.isNull(inputValue);
}

// TODO: get value based on 'environment' field too
function extractPreExistingValue(state, namespace) {
  return lib._input.get(state, namespace);
}

function updateOuput(state, namespace, value) {
  lib._output.set(state, namespace, value);
}

function updateInput(state, item) {
  if (item.input === "user") {
    lib._input.set(state, item.namespace, item.value);
  } else {
    lib._input.set(state, item.namespace, undefined);
  }
}

function save(state, list) {
  _.each(list, item => {
    lib.updateOuput(state, item.namespace, item.value);
    lib.updateInput(state, item);
  });
  return list;
}

function exitWithFailure(item) {
  console.error();
  console.error("ERROR: user input is not allowed:", item.namespace.join("."));
  console.error();
  process.exit(1);
}

function getUserInputs(state, list) {
  return _.map(list, item => {
    const userInputsAllowed = _.get(state, "program.userInputs", true);
    const underReview = _.get(state, "program.review", false);
    const underPattern = _.get(state, "program.pattern", false);

    if (item.input === "user") {
      let value;
      if (lib.isThereAPreExistingValue(state, item.namespace)) {
        if (
          underReview ||
          (underPattern && _.includes(item.namespace, underPattern))
        ) {
          value = lib.extractPreExistingValue(state, item.namespace);
          if (userInputsAllowed) {
            value = lib.promptUserForValue(
              state,
              item.namespace,
              _.assign({}, item, { value: undefined, default: value })
            );
          } else {
            lib.exitWithFailure(item);
          }
        } else {
          value = lib.extractPreExistingValue(state, item.namespace);
        }
      } else if (userInputsAllowed) {
        value = lib.promptUserForValue(state, item.namespace, item);
      } else {
        lib.exitWithFailure(item);
      }
      return _.assign({}, item, { value });
    } else {
      return item;
    }
  });
}

function removedUnusedEnvironments(state, list) {
  return _.filter(list, item =>
    lib._environment.isPartOf(state, item.namespace)
  );
}

function flow(initialInputs, ...functions) {
  const newFunctions = _.map(functions, f => (_.isFunction(f) ? f : () => f));
  return _.flow(newFunctions)(...initialInputs);
}

function echo(x) {
  //  console.log(JSON.stringify(x, null, 2));
  return x;
}

function generate(inState) {
  const state = lib._output.initialize(inState);
  const exampleObject = lib._example.get(state);
  const namespace = [];
  return lib.flow(
    [exampleObject],
    lib._power.processObject(state, namespace),
    lib.echo,
    lib.removedUnusedEnvironments(state),
    lib.getUserInputs(state),
    lib.save(state),
    state
  );
}

lib = {
  _file: require("./file"),
  _environment: require("./environment"),
  _input: require("./input"),
  _output: require("./output"),
  _example: require("./example"),
  _power: require("./power"),

  echo,
  extractPreExistingValue,
  flow,
  generate,
  exitWithFailure,
  getUserInputs: _.curry(getUserInputs),
  isThereAPreExistingValue,
  promptUserForValue,
  removedUnusedEnvironments: _.curry(removedUnusedEnvironments),
  save: _.curry(save),
  updateInput,
  updateOuput
};

module.exports = lib;
