# power-config

example + input = configuration

## Features

* Example files can be written in JSON or YAML
* Output files can be JSON or YAML
* Values can be hard coded or prompted for user input

## API Examples

### The `description` field

The `description` field provides the user with some context or instruction for the entering the input for the given data field. For example, the data field (i.e. `hostname`) is used as the prompt.

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

### The `type` field

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

### The `value` field

The `value` field simply hard-codes the data value without any input from the user.

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

### The `include` field

The `include` field is an alternative to using the `value` field as a means of providing hard-coded input. It specifies the path to a file that will be read and parsed based on the file type.

```json
{
  "avengers": {
    "include": "examples/json/avengers.json"
  },
  "jla": {
    "include": "examples/json/jla.yml"
  }
}
```

The included file does not have to be the same file type as the source file. You can include a JSON file: `examples/json/avengers.json`

```json
["blackwidow", "captain", "hawkeye", "hulk", "ironman", "thor"]
```

Or you can include a YAML file: `examples/json/jla.yml`

```yaml
- batman
- flash
- aquaman
- wonderwoman
- cyborg
```

`npm run power-config -- -x examples/json/include.example.json`

```json
{
  "avengers": ["blackwidow", "captain", "hawkeye", "hulk", "ironman", "thor"],
  "jla": ["batman", "flash", "aquaman", "wonderwoman", "cyborg"]
}
```

### The `steps` field

The `steps` field enhances the `description` field by providing a list of step-by-step instructions on how the user can find the information needed for input.

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

### Using reserved words as data fields

You might want to define a data field that is the same name as one of the field names used in the `power-config` API. For example, you might want to define a field called `type`. To do that, you must wrap the field name with a leading and a trailing underscore.

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

### Adding nested structure

The structure of your configuration file does not have to be flat. You can create a namespace by nesting values within values.

```json
{
  "server": {
    "database": {
      "hostname": {
        "description": "The hostname"
      },
      "port": {
        "description": "The port",
        "type": "integer"
      }
    },
    "proxy": {
      "hostname": {
        "description": "The hostname"
      },
      "port": {
        "description": "The port",
        "type": "integer"
      }
    }
  }
}
```

`npm run power-config -- -x examples/json/nested.example.json`

```text
DESCRIPTION: The hostname

TYPE: string

server -> database -> hostname : blue
----------
DESCRIPTION: The port

TYPE: integer

server -> database -> port : 3000
----------
DESCRIPTION: The hostname

TYPE: string

server -> proxy -> hostname : green
----------
DESCRIPTION: The port

TYPE: integer

server -> proxy -> port : 8080
```

Each prompt shows the entire nested namespace. The output is `examples/json/nested.json`

```json
{
  "server": {
    "database": {
      "hostname": "blue",
      "port": 3000
    },
    "proxy": {
      "hostname": "green",
      "port": 8080
    }
  }
}
```

### Working with multiple environments

It is not uncommon to have multiple environments, such as development, test, and production. And as soon as you have multiple environments, your configuration will need to be different in each of those environments.

`power-config` supports multiple working environments in a variety of ways so that you can create your configuration file exactly how you want it. By default, `power-config` is aware of the following environments: `local`, `dev`, `test`, and `prod`. (See the CLI examples on how you can change this default.)

In your example file, you can use the environment just like any other nested namespace.

```json
{
  "dev": {
    "port": {
      "description": "The port",
      "type": "integer"
    }
  },
  "test": {
    "port": {
      "description": "The port",
      "type": "integer"
    }
  },
  "prod": {
    "port": {
      "description": "The port",
      "type": "integer"
    }
  }
}
```

The ability to change the structure of the output configuration file rests in the command-line options specified. The first output structure includes all the environments and is created by simply specifying the example file.

`npm run power-config -- -x examples/json/environments1.example.json`

```text
DESCRIPTION: The port

TYPE: integer

dev -> port : 8080
----------
DESCRIPTION: The port

TYPE: integer

test -> port : 8080
----------
DESCRIPTION: The port

TYPE: integer

prod -> port : 80
```

Notice you were prompted for all three environments and the output included all three environments.

```json
{
  "dev": {
    "port": 8080
  },
  "test": {
    "port": 8080
  },
  "prod": {
    "port": 80
  }
}
```

The second output structure limits the scope to just one environment by specifying the environment using `-e`.

`npm run power-config -- -x examples/json/environments2.example.json -e test`

```text
DESCRIPTION: The port

TYPE: integer

test -> port : 8080
```

Notice you were only prompted for the one environment and the output only included the one environment.

```json
{
  "test": {
    "port": 8080
  }
}
```

Finally, the third output structure not only limits the scope to just one environment but also flattens the output using `-f` and removes the environment namespace.

`npm run power-config -- -x examples/json/environments3.example.json -e test -f`

```text
DESCRIPTION: The port

TYPE: integer

test -> port : 8080
```

Again, you were only prompted for the one environment but now the output does not include the environment itself.

```json
{
  "port": 8080
}
```

Of course, using the environment as a namespace is not limited to the top level. The environments can also be used at any level of the namespace. You can change the structure of the output, just like the previous three examples, by specifying command-line options.

```json
{
  "port": {
    "dev": {
      "value": 80
    },
    "test": {
      "description": "The port",
      "type": "integer"
    },
    "prod": {
      "description": "The port",
      "type": "integer"
    }
  }
}
```

First, simply specify the example file.

`npm run power-config -- -x examples/json/environments4.example.json`

```json
{
  "port": {
    "dev": 80,
    "test": 8080,
    "prod": 80
  }
}
```

Second, limit the scope to just one environment.

`npm run power-config -- -x examples/json/environments5.example.json -e test`

```json
{
  "port": {
    "test": 8080
  }
}
```

And third, limit the scope to just one environment and flatten.

`npm run power-config -- -x examples/json/environments6.example.json -e test -f`

```json
{
  "port": 8080
}
```

### The `environment` field

The `environment` field is an alternative to the environments namespace as a means to limit the scope of the data field to one or more environments. You can set the value as a single string or an array of strings.

```json
{
  "hostname": {
    "description": "The hostname",
    "type": "string"
  },
  "port": {
    "description": "The port",
    "type": "integer",
    "environment": ["test", "prod"]
  },
  "domain": {
    "description": "The domain",
    "type": "string",
    "environment": "test"
  },
  "ip": {
    "description": "The IP address",
    "type": "string",
    "environment": "prod"
  }
}
```

`npm run power-config -- -x examples/json/environment1.example.json -e dev`

```text
DESCRIPTION: The hostname

TYPE: string

hostname : wakanda
```

```json
{
  "hostname": "wakanda"
}
```

`npm run power-config -- -x examples/json/environment2.example.json -e test`

```text
DESCRIPTION: The hostname

TYPE: string

hostname : wakanda
----------
DESCRIPTION: The port

TYPE: integer

port : 8080
----------
DESCRIPTION: The domain

TYPE: string

domain : mcu
```

```json
{
  "hostname": "wakanda",
  "port": 8080,
  "domain": "mcu"
}
```

`npm run power-config -- -x examples/json/environment3.example.json -e prod`

```text
DESCRIPTION: The hostname

TYPE: string

hostname : wakanda
----------

DESCRIPTION: The port

TYPE: integer

port : 8080
----------

DESCRIPTION: The IP address

TYPE: string

ip : 127.0.0.0
```

```json
{
  "hostname": "wakanda",
  "port": 8080,
  "ip": "127.0.0.0"
}
```

## CLI Examples

* re-running commands
* the dot file
* the rc file
