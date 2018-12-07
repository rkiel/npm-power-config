const yaml = require('js-yaml');

const fs = require('fs');

let lib;

function paresYamlFile(pathToFile) {
  if (fs.existsSync(pathToFile)) {
    console.log('Reading', pathToFile);
    const contents = fs.readFileSync(pathToFile, 'utf8');
    const json = yaml.safeLoad(contents);
    return json;
  } else {
    console.error(`${pathToFile} does not exist`);
    process.exit(1);
  }
}

lib = {
  paresYamlFile
};

module.exports = lib.paresYamlFile;
module.exports.lib = lib;
