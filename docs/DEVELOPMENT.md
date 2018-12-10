# npm-power-config

[Building command line tools with Node.js](https://developer.atlassian.com/blog/2015/11/scripting-with-node/)

[Commander.js](https://github.com/tj/commander.js/)

JSON examples

```bash
rm -rf examples/json/.*.json
node cli.js -x examples/json/boolean.example.json
node cli.js -x examples/json/environment.example.json -e test
node cli.js -x examples/json/environment2.example.json -e dev
node cli.js -x examples/json/environment3.example.json -e test
node cli.js -x examples/json/include.example.json
node cli.js -x examples/json/integer.example.json
node cli.js -x examples/json/nested.example.json
node cli.js -x examples/json/steps.example.json
node cli.js -x examples/json/string.example.json
node cli.js -x examples/json/type.example.json
node cli.js -x examples/json/value.example.json
```

Prepare to publish

```bash
npm version patch

feature rebase

feature merge
```

Publish

```bash
npm login
npm publish
```
