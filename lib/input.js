const _ = require("lodash");
const prompt = require("prompt-sync")({ sigint: true });

let lib;

function _something(name) {
  const parts = _.split(name, ".");
  return _.map(parts, p =>
    p === "example" || p === "sample" ? "inputs" : p
  ).join(".");
}

function addFileName(state) {
  const fileName = _.get(state, "program.input");
  if (_.isUndefined(fileName) || _.isNull(fileName)) {
    const parts = _.split(
      _.get(state, "example.fileName", lib._example.DEFAULT),
      "/"
    );
    // output fileName has a slash in the name
    if (parts.length > 1) {
      const last = parts.pop();
      _.set(
        state,
        "input.fileName",
        _.concat(parts, lib._something(last)).join("/")
      );
    } else {
      _.set(state, "input.fileName", lib._something(parts));
    }
  } else {
    _.set(state, "input.fileName", fileName);
  }
  return state;
}

function readFile(state) {
  const json = lib._file.parse(_.get(state, "input.fileName"), {});
  const path = _.get(state, "program.clear");
  if (!_.isUndefined(path)) {
    const groups = _.split(path, ",");
    _.each(groups, group => {
      const parts = _.split(group, "=");
      if (parts.length === 2) {
        _.set(json, parts[0], parts[1]);
      } else {
        _.set(json, group, undefined);
      }
    });
  }
  _.set(state, "input.json", json);
  return state;
}

function writeFile(state) {
  const fileName = _.get(state, "input.fileName");
  const json = _.get(state, "input.json");
  lib._file.write(fileName, json);
  return state;
}

function _displayStepsIterator(spacer, step, index) {
  if (_.isArray(step)) {
    lib._displaySteps(step, spacer + "    ");
  } else {
    console.log(`${spacer}- ${step}`);
  }
}

function _displaySteps(steps, spacer = "") {
  _.each(steps, lib._displayStepsIterator(spacer));
}

function promptForAnswer(fullPath, value) {
  console.log("=================================");
  if (value.description) {
    console.log();
    if (_.isArray(value.description)) {
      lib._displaySteps(value.description);
    } else {
      console.log(value.description);
    }
  }
  if (value.steps) {
    console.log();
    console.log("STEPS:");
    lib._displaySteps(value.steps);
  }
  if (value.type && value.type !== "string") {
    console.log();
    console.log("TYPE:", value.type || "string");
  }
  if (_.includes(["arrayOfString", "arrayOfInteger"], value.type)) {
    console.log();
    console.log(
      "(NOTE: enter one value at a time; blank when finished; blank for default)"
    );
  }

  const msg = [fullPath.join(".")];
  const defaultValue = _.get(value, "default");
  if (!_.isUndefined(defaultValue)) {
    if (_.includes(["arrayOfString", "arrayOfInteger"], value.type)) {
      //msg.push(`[ ${defaultValue.join(",,")} ]`);
      console.log();
      console.log("DEFAULT:");
      _.each(defaultValue, x => console.log(x));
    } else {
      msg.push(`[ ${defaultValue} ]`);
    }
  }
  msg.push(":");
  msg.push("");

  console.log();
  if (_.includes(["arrayOfString", "arrayOfInteger"], value.type)) {
    const result = promptForMultiLineAnswer(msg);
    if (_.isUndefined(defaultValue)) {
      return result;
    } else if (result.length === 0) {
      return defaultValue;
    } else {
      return result;
    }
  } else {
    return prompt(msg.join(" "), defaultValue);
  }
}

function promptForMultiLineAnswer(msg, results = []) {
  const answer = prompt(msg.join(" "), "");
  if (_.trim(answer) === "") {
    return results;
  } else {
    return promptForMultiLineAnswer(msg, results.concat(answer));
  }
}

function convertType(value, answer) {
  switch (value.type) {
    case "boolean":
      return _.includes(["yes", "true"], _.trim(answer).toLowerCase());
    case "integer":
      return parseInt(_.trim(answer), 10);
    case "arrayOfString":
      return _.map(answer, x => _.trim(x));
    case "arrayOfInteger":
      return _.map(answer, x => parseInt(_.trim(x), 10));
    default:
      return _.trim(answer);
  }
}

function get(state, parts) {
  //  return _.get(state, _.concat(['input', 'json'], lib._environment.expand(state, parts)).join('.'));
  return _.get(state, _.concat(["input", "json"], parts).join("."));
}

function set(state, parts, value) {
  return _.set(
    state,
    _.concat(["input", "json"], lib._environment.expand(state, parts)).join(
      "."
    ),
    value
  );
}

lib = {
  _file: require("./file"),
  _example: require("./example"),
  _environment: require("./environment"),

  _displayStepsIterator: _.curry(_displayStepsIterator),
  _displaySteps,
  _something,
  addFileName,
  readFile,
  writeFile,
  promptForAnswer,
  convertType,
  get,
  set
};

module.exports = lib;
