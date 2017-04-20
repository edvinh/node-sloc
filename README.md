# node-sloc
A small tool written in node for counting source lines of code. Currently only available as a CLI. 

## Installation
```npm install -g edvinh/node-sloc```

## Usage
``` node-sloc [path] [options] ```
### Options
```
-h, --help                   Prints usage information

-l, --list-extensions        Lists all default file extensions

-e, --extra-extensions       Include non-default file extensions,
                             specified by a comma separated string of extensions

-i, --ignore-extensions      Include list of file extensions to ignore,
                             specified by a comma separated string of extensions

-v, --verbose                Output extra information during execution


```
## Examples
```
node-sloc "../app"
node-sloc "../app" --extra-extensions "aaa, bbb, ccc" --ignore-extensions "xml, yaml"
node-sloc file.js
```
