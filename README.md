# npm-power-config

[Building command line tools with Node.js](https://developer.atlassian.com/blog/2015/11/scripting-with-node/)

[Commander.js](https://github.com/tj/commander.js/)

## Features

* Example files can be written in JSON or YAML
* Output files can be JSON or YAML

## Examples

```json
{
  "make": "honda",
  "model": "accord",
  "color": "blue",
  "year": 2018,
  "new": true
}
```

```json
{
  "make": {
    "description": "This is the make of the car",
    "title": "Make of car",
    "type": "string"
  },
  "model": {
    "description": "This is the model of the car",
    "title": "Model of car",
    "type": "string"
  },
  "color": {
    "description": "This is the color of the car",
    "title": "Color of car",
    "type": "string"
  },
  "year": {
    "description": "This is the model year of the car",
    "title": "Model year",
    "type": "integer"
  },
  "new": {
    "description": "Is this car new or used",
    "title": "New car",
    "type": "boolean"
  }
}
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
