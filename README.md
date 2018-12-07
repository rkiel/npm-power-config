# power-config

## Features

* Example files can be written in JSON or YAML
* Output files can be JSON or YAML
* Values can be hard coded or prompted for user input

## Examples

Here's a completely contrived example to illustrate how to use `power-config`. Suppose we have some kind of automotive application which needs a configuration file.

We can create a JSON file that describes the information and structure of the configuration file called `automotive.json.example`.

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
  },
  "history": {
    "_path_": true,
    "established": {
      "description": "This is first year of the car",
      "title": "Established",
      "type": "integer"
    },
    "wheels": {
      "value": 4
    }
  }
}
```

We can run `power-config` with the example configuration file.

```bash
npm run power-config -- -x automotive.json.example
```

Since this is the first time using this example configuration file, we are prompted for the values.

```text
This is the make of the car
Make of car: Honda

This is the model of the car
Model of car: Accord

This is the color of the car
Color of car: blue

This is the model year of the car
Model year: 2018

Is this car new or used
New car: yes

This is first year of the car
Established: 1990
```

`power-config` will create the actual configuration file `automotive.json`.

```json
{
  "make": "Honda",
  "model": "Accord",
  "color": "blue",
  "year": 2018,
  "new": true,
  "history": {
    "established": 1990,
    "wheels": 4
  }
}
```

We can create a YAML file that describes the information and structure of the configuration file called `automotive.yaml.example`.

```yaml
make:
  description: This is the make of the car
  title: Make of car
  type: string
model:
  description: "This is the model of the car"
  title: "Model of car"
  type: "string"
color:
  description: "This is the color of the car"
  title: "Color of car"
  type: "string"
year:
  description: "This is the model year of the car"
  title: "Model year"
  type: "integer"
new:
  description: "Is this car new or used"
  title: "New car"
  type: "boolean"
history:
  _path_: true
  established:
    description: This is first year of the car
    title: Established
    type: integer
  wheels:
    value: 4
```

We can run `power-config` with the example configuration file.

```bash
npm run power-config -- -x automotive.yaml.example
```

`power-config` will create the actual configuration file `automotive.yaml`.

```yaml
make: Honda
model: Accord
color: blue
year: 2018
new: true
history:
  established: 1990
  wheels: 4
```
