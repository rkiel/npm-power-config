# npm-power-config

[Building command line tools with Node.js](https://developer.atlassian.com/blog/2015/11/scripting-with-node/)

[Commander.js](https://github.com/tj/commander.js/)

YAML examples

```bash
node cli.js -x examples/yaml/simple.example.yml
node cli.js -x examples/yaml/value.example.yml
node cli.js -x examples/yaml/type.example.yml
node cli.js -x examples/yaml/default.example.yml
node cli.js -x examples/yaml/include.example.yml
node cli.js -x examples/yaml/description.example.yml
node cli.js -x examples/yaml/steps.example.yml
node cli.js -x examples/yaml/reserved.example.yml
node cli.js -x examples/yaml/nested.example.yml
node cli.js -x examples/yaml/environments1.example.yml
node cli.js -x examples/yaml/environments2.example.yml -e test
node cli.js -x examples/yaml/environments3.example.yml -e test -f
node cli.js -x examples/yaml/environments4.example.yml
node cli.js -x examples/yaml/environments5.example.yml -e test
node cli.js -x examples/yaml/environments6.example.yml -e test -f
node cli.js -x examples/yaml/environment1.example.yml -e dev
node cli.js -x examples/yaml/environment2.example.yml -e test
node cli.js -x examples/yaml/environment3.example.yml -e prod
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
