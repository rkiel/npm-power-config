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
    "description": "The make of the car",
    "steps": ["go to AWS Console", "select IAM", "click on Users"],
    "type": "string"
  },
  "model": {
    "description": "The model of the car",
    "type": "string"
  },
  "color": {
    "description": "The color of the car",
    "type": "string"
  },
  "year": {
    "description": "The model year of the car",
    "type": "integer"
  },
  "new": {
    "description": "Is this a new car?",
    "type": "boolean"
  },
  "history": {
    "_path_": true,
    "established": {
      "description": "First year of the car",
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
----------
DESCRIPION: The make of the car

STEP 1.  go to AWS Console
STEP 2.  select IAM
STEP 3.  click on Users

TYPE: string

make : Honda
----------
DESCRIPION: The model of the car

TYPE: string

model : Accord
----------
DESCRIPION: The color of the car

TYPE: string

color : blue
----------
DESCRIPION: The model year of the car

TYPE: integer

year : 2018
----------
DESCRIPION: Is this a new car?

TYPE: boolean

new : yes
----------
DESCRIPION: First year of the car

TYPE: integer

history -> established : 1990
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
  description: The make of the car
  steps:
    - go to AWS Console
    - select IAM
    - click on Users
  type: string
model:
  description: The model of the car
  type: string
color:
  description: The color of the car
  type: string
year:
  description: The model year of the car
  type: integer
new:
  description: Is this a new car?
  type: boolean
history:
  _path_: true
  established:
    description: First year of the car
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
