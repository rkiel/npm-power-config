# power-config

A tool for generating a configuration file.

Features

* Command-line tool that can prompt user for input
* Values can be hard-coded or entered by user
* Supports using both JSON and YAML
* Supports multiple environments, such as dev, test, and prod
* Makes tracking configuration file changes over time easier

## Background

Applications and software tools often need run-time specific information. Rather than hard-coding this information into the application, the information is separated out into either environment variables and/or some kind of "configuration file". A "configuration file" is simply a set of key/value pairs, such as `port = 8080`. In some cases, a "configuration file" includes structure by nesting key/value pairs within a namespace.

Sometimes the amount of run-time configuration information is very simple or small. In those cases, `power-config` is probably overkill and environment variables or a simple hand-written configuration file is good enough.

In other cases, an application requires significant amounts of run-time configuration. Again, you could get by with a hand-written configuration file but experience has shown this presents some challenges.

* As your application code changes over time and moves through the stages of local development, integration testing, and live in production, the content and structure of your configuration file needs to reflect those changes.
* Maintaining multiple configuration files for development, test, and production is not DRY and can be challenging to keep synchronized.
* Documentation for configuration files is often lacking. A best practice is to include an example configuration file in your source code. However, the place holders for the key/value pairs don't necessarily include context and instructions for new developers on how or where to get the actual values. Some formats, such as JSON, don't even support comments.

## Introducing `power-config`

The `power-config` tool attempts to address the challenges of maintaining a significant configuration file.

It starts with the best practice of an example configuration file that is part of your source code. But rather than simply having a key/value pair and a placeholder for its value, it uses the value to describe the value itself. This supports documentation for new developers. The description can either be a hard-coded value or a prompt for the user to enter a value. The prompt can also include step-by-step instructions for how and where to get the value.

`power-config` will read the example configuration file and generate the configuration file. In cases where user input is required, `power-config` will prompt the user, capture the input, and save it to another file, the "input file". The "input file", unlike the "example file", should probably not be part of your source code as it might contain sensitive data.

As your code moves from local development, to integration testing, to live in production, you re-run `power-config` with the "input file". If the "input file" already contains a value, the user will not prompted and the value will be passed through to the "configuration file". If the value does not exist, then the use will be prompted and the "input file" will be updated.

The intent of `power-config` is have one "example file" and one "input file" that can generate a "configuration file" for development, test, and production. This will keep things DRY. The key/value pairs in the "example file" can be associated with different environments.

## A Tale of Three Files

example + input = output

### The Example File

The "example file" is written by developers, in either JSON or YAML, and describes the data fields and structure of the configuration file you wish to generate. It is intended to be checked into source control so that changes to your configuration file can be tracked over time. Since it is intended for source control, it should never contain any sensitive data.

When `power-config` is run, it reads the "example file" and prompts the user for any necessary inputs.

### The Input File

The "input file" is automatically read and updated by `power-config`, in either JSON or YAML, and captures all the input values entered by the user. It is NOT intended for this file to ever be checked into source control. This file is where sensitive data is captured and saved. The "input file", or a copy of it, should be stored in some kind of virtual safety deposit box, like cloud storage, that is reliably backed up, protected from unauthorized access, and not publicly discoverable.

When `power-config` is run, it reads the "input file" along with the "example file". If the "example file" contains any data fields not included in the "input file", the user will be prompted for input. The user input will be captured and the "input file" will be updated.

### The Output File

The "output file", also known as the "configuration file", is automatically generated by `power-confg`, in either JSON or YAML. This is the file that your application will use at run-time. It is NOT intended for this file to ever be checked into source control since it can contain sensitive data. The file does not need to be backed up either. The combination of the two backed up files, "example file" and "input file", will allow you to re-create the "output file" at any time.

## Installation

Installing `power-config` is just like any other npm package. I would recommend using `--save-dev` to include it in the `devDependencies`. You could install it globally with the `-g` option, but I personally like installing everything locally. This way everything is self-contained within the project, I don't run into any permissions problems, and I can control the package versions on a per project basis.

```bash
npm install --save-dev power-config
```

Once installed, you can add some scripts to `package.json` to make `power-config` easier to work with locally.

```bash
vim package.json
```

Add whatever scripts you want. Here are some suggestions.

```json
"scripts": {
  "power-config": "power-config",
  "pc": "power-config"
}
```

With the scripts in place, you can use `npm run` to run `power-config`. You will have to include `--` on the command-line to pass thru the arguments.

```bash
npm run power-config -- --help
npm run pc -- --help
```

## API Examples

The "example file" can be written in either JSON or YAML. The API examples shown here are all in JSON.

### The simplest case

The simplest case is to just hard-code the data value without any input from the user.

```json
{
  "port": 8080
}
```

`npm run power-config -- -x examples/json/simple.example.json`

Since no input is needed from the user, the output file is automatically created as `examples/json/simple.json`.

```json
{
  "port": 8080
}
```

Rather than hard-coding a specific string, boolean, or numeric value, you can define an object which includes metadata about the configuration item. The following sections describe the various metadata fields.

### The `value` field

The `value` field simply hard-codes the data value without any input from the user. If a `value` field is not specified, the user will be prompted to enter a value.

```json
{
  "port": {
    "value": 8080
  }
}
```

`npm run power-config -- -x examples/json/value.example.json`

Since no input is needed from the user, the output file is automatically created as `examples/json/value.json`.

```json
{
  "port": 8080
}
```

### The `type` field

The `type` field defines how the user input will be stored. The value can be one of: `string`, `integer`, or `boolean`. This is an optional field and will default to `string`.

```json
{
  "hostname": {
    "type": "string"
  },
  "port": {
    "type": "integer"
  },
  "public": {
    "type": "boolean"
  }
}
```

`npm run power-config -- -x examples/json/type.example.json`

```text
TYPE: string

hostname : wakanda
----------
TYPE: integer

port : 8080
----------
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

### The `default` field

The `default` field defines the value when the user does not provide any input. This is an optional field. If provided, the default value will be displayed in the prompt inside brackets.

```json
{
  "port": {
    "default": 80
  }
}
```

`npm run power-config -- -x examples/json/default.example.json`

```text
TYPE: string

port [80] :
```

The output is `examples/json/default.json`.

```json
{
  "port": 80
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

When a data field has no `environment` field defined, then the data field applies to all environments. Running with `-e dev` will prompt the user for only one input.

`npm run power-config -- -x examples/json/environment1.example.json -e dev`

```text
DESCRIPTION: The hostname

TYPE: string

hostname : wakanda
```

The output only includes the one value.

```json
{
  "hostname": "wakanda"
}
```

Running with `-e test` will prompt the user for three inputs.

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

The output only includes three values. And notice that the environment does not get included in the output. With the `environment` field, you do not need to use `-f`.

```json
{
  "hostname": "wakanda",
  "port": 8080,
  "domain": "mcu"
}
```

Running with `-e prod` will prompt the user for a different set of three inputs.

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

The output only includes three values.

```json
{
  "hostname": "wakanda",
  "port": 8080,
  "ip": "127.0.0.0"
}
```

## CLI Examples

The `power-config` command-line tool supports a number of options.

```bash
npm run power-config -- --help
```

```text
Usage: power-config [options]

Options:
  -V, --version                    output the version number
  -i, --input <input>              input configuration file
  -o, --output <output>            output configuration file
  -x, --example <example>          example configuration file. Default is environment.example.json
  -e, --environment <environment>  environment such as dev, test, or prod
  -f, --flatten                    flatten nested environment
  -h, --help                       output usage information
```

### Running with no options

If you run `power-config` with no options, it uses the following defaults:

* the "example file" is `environment.example.json`
* the "input file is" `.environment.json`
* the "output file" is `environment.json`

### The `--example` option

Use the `--example` option to specify the "example file". The file can be written in either JSON or YAML.

`npm run power-config -- -x my_system_config.json`

`npm run power-config -- -x my_system_config.yml`

If this option is not specified, then the default will be `environment.example.json`

### The `--output` option

Use the `--output` option to specify the "output file". The file can be written in either JSON or YAML.

`npm run power-config -- -o configuration.json`

`npm run power-config -- -o configuration.yml`

If this option is not specified, then the default will be to use the name of the "example file" with the words "example" and "sample" removed. The output format will default to the same type as the "example file".

`npm run power-config -- -x environment.example.json # (output file is environment.json)`

`npm run power-config -- -x environment.sample.json # (output file is environment.json)`

### The `--input` option

Use the `--input` option to specify the "input file". The file can be written in either JSON or YAML.

`npm run power-config -- -i my_configuration.json`

`npm run power-config -- -i my_configuration.yml`

If this option is not specified, then the default will be to use the name of the "ouput file" with a dot added in front of the file name. The dot will make the file hidden on Linux. The input format will default to the same type as the "output file".

`npm run power-config -- -o environment.json # (input file is .environment.json)`

`npm run power-config -- -o path/to/environment.yml # (input file is path/to/.environment.yml)`

### The `--environment` option

Use the `--environment` option to limit the scope to a specific environment. The default set of environments is:
`local`, `dev`, `test`,`prod`. You can change the set of environments using the `.power-config` file.

`npm run power-config -- -e test`

If this option is not specified, then all environments will be processed.

### The `--flatten` option

Use the `--flatten` option in conjunction with the `--environment` option to compress the structure of the output file by eliminating the environment from the namespace.

`npm run power-config -- -e test -f`

### Running with different formats

`power-config` fully supports both JSON and YAML. The example, input, and output files do not all have to be the same format. You can mix and match the formats by specifying the names with the appropriate extensions using `-x`, `-o`, `-i` options.

`npm run power-config -- -x example.yml -o environment.json -i my_environment.yml`

### The `.power-config` rc file

You can customize `power-config` using an rc file written in either JSON or YAML. `power-config` will search for the rc file in the following order:

```bash
./.power-config.json  # project directory
./.power-config.yml   # project directory
~/.power-config.json  # HOME directory
~/.power-config.yml   # HOME directory
```

In the rc file, you can change the default set of environments by specifying an array of values.

```json
{
  "environments": ["development", "integration", "live"]
}
```
