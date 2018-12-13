# power-config

example + input = configuration

## Features

* Example files can be written in JSON or YAML
* Output files can be JSON or YAML
* Values can be hard coded or prompted for user input

## API Examples

### Description

The `description` field provides the user with some context or instruction for the entering the input. The data field (i.e. `hostname`) is used as the prompt.

```json
{
  "hostname": {
    "description": "The hostname"
  }
}
```

`npm run power-config -- -x examples/json/description.example.json`

```text
DESCRIPTION: The hostname

TYPE: string

hostname : wakanda
```

The output is `examples/json/description.json`

```json
{
  "hostname": "wakanda"
}
```

### Type

The `type` field defines how the user input will be stored. The value can be one of: `string`, `integer`, or `boolean`. This is an optional field and will default to `string`.

```json
{
  "hostname": {
    "description": "The hostname",
    "type": "string"
  },
  "port": {
    "description": "The port",
    "type": "integer"
  },
  "public": {
    "description": "Is this public?",
    "type": "boolean"
  }
}
```

`npm run power-config -- -x examples/json/type.example.json`

```text
DESCRIPTION: The hostname

TYPE: string

hostname : wakanda
----------

DESCRIPTION: The port

TYPE: integer

port : 8080
----------

DESCRIPTION: Is this public?

TYPE: boolean

public : no
```

The output is `examples/json/type.json`

```json
{
  "hostname": "wakanda",
  "port": 8080,
  "public": false
}
```

### Value

Sometimes no user input is needed. The `value` field can be used to simply set the value.

```json
{
  "port": {
    "value": 8080
  }
}
```

`npm run power-config -- -x examples/json/value.example.json`

```json
{
  "port": 8080
}
```

### Steps

Sometimes a `description` might not be the best way to help the user with the input. The `steps` field can provide a list of step-by-step instructions on how to get the information needed.

```json
{
  "username": {
    "description": "The AWS username",
    "steps": ["go to AWS Console", "select IAM", "click on Users"]
  }
}
```

`npm run power-config -- -x examples/json/steps.example.json`

```text
DESCRIPTION: The AWS username

STEP 1.  go to AWS Console
STEP 2.  select IAM
STEP 3.  click on Users

TYPE: string

username : sally
```

The output is `examples/json/steps.json`

```json
{
  "username": "sally"
}
```

### Reserved words

In some cases, you might want to define a field name that is a reserved word used by `power-config`. For example, you might want to define a field called `type`. Since `power-config` already uses that, you must wrap the field name with a leading and a trailing underscore.

```json
{
  "_type_": {
    "description": "The type"
  }
}
```

`npm run power-config -- -x examples/json/reserved.example.json`

```text
DESCRIPTION: The type

TYPE: string

_type_ : EC2 Instance
```

The output is `examples/json/reserved.json`

```json
{
  "type": "EC2 Instance"
}
```
