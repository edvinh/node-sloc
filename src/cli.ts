import chalk from 'chalk'
import * as sloc from './sloc'
import * as utils from './utils'
import { extensions as fileExtensions } from './file-extensions'
import minimist from 'minimist'
import { Options } from './types'

const allowedExtensions = fileExtensions.map((x) => x.lang)
const args = minimist(process.argv.slice(2))

const info = chalk.bold.blue
const output = chalk.bold.gray
const error = chalk.bold.red
const result = chalk.bold.green

const { version } = require('../package.json')

const helpText = `
  node-sloc v. ${version}

  usage:
             node-sloc [path] [options]
  options:
             -h, --help                         Prints usage information

             -l, --list-extensions              Lists all default file extensions

             -e, --include-extensions <list>    Include non-default file extensions,
                                                specified by a comma separated string of extensions

             -i, --ignore-extensions <list>     Include list of file extensions to ignore,
                                                specified by a comma separated string of extensions

             -x, --ignore-paths <list>          Include a list of folders to exclude. Supports glob patterns

             -d, --ignore-default               Ignore the default file extensions

             -v, --verbose                      Output extra information during execution

  examples:
             node-sloc ../app
             node-sloc ../app --include-extensions "aaa, bbb, ccc" --ignore-extensions "xml, yaml"
             node-sloc ../app --ignore-paths "node_modules, **/*.test.js"
             node-sloc file.js
   `

let extensions = allowedExtensions
let extraExtensions: string[] = []
let ignoreExtensions: string[] = []
let ignorePaths: string[] = []

const handleExtensionString = (param: string, shorthand: string) => {
  const arg = args[param] || args[shorthand]
  if (!arg) {
    console.log(error(`Missing argument for --${param}`))
    process.exit(0)
  }

  // Strip spaces, slashes and dots and split on comma
  return arg.replace(/ |\.|\\|\//g, '').split(',')
}

const handlePathString = (param: string, shorthand: string) => {
  const arg = args[param] || args[shorthand]
  if (!arg) {
    console.log(error(`Missing argument for --${param}`))
    process.exit(0)
  }

  // Strip spaces and split on comma
  return arg.replace(/ /g, '').split(',')
}

// Help
if (args.help || args.h) {
  console.log(helpText)
  process.exit(0)
}

// List extensions
if (args['list-extensions'] || args.l) {
  console.log('Supported file extensions:\n', `.${allowedExtensions.join('\n .')}`)
  process.exit(0)
}

// Path
if (args._.length === 0) {
  console.log(error('No file or directory specified.\n'), helpText)
  process.exit(0)
}

// Extra extensions
if (args['include-extensions'] || args.e) {
  extraExtensions = handleExtensionString('include-extensions', 'e')
}

// Ignore extensions
if (args['ignore-extensions'] || args.i) {
  ignoreExtensions = handleExtensionString('ignore-extensions', 'i')
}

if (args['ignore-paths'] || args.x) {
  ignorePaths = handlePathString('ignore-paths', 'x')
}

// Custom extensions
if (args['ignore-default'] || args.d) {
  if (extraExtensions.length === 0) {
    console.log(
      error('Error: flag --ignore-default was set but no file extensions were specified.')
    )
    process.exit(0)
  }
  extensions = []
}

const filepath = args._[0] // Directory or file path
console.log(info('Reading file(s)...'))
const filteredExtensions = [...extensions, ...extraExtensions].filter(
  (e) => !ignoreExtensions.includes(e)
)

const options: Options = {
  path: filepath,
  extensions: filteredExtensions,
  logger: args.verbose || args.v ? (v) => console.log(output(v)) : undefined,
  ignorePaths: ignorePaths,
}

sloc
  .walkAndCount(options)
  .then((res) => {
    // res is null if no files were read
    if (!res) {
      console.log(
        error('Unknown file extension. Use flag --extra-extensions to include extensions.')
      )
      process.exit(0)
    }
    console.log(result(utils.prettyPrint(res)))
  })
  .catch((err) => {
    console.log(error(err))
    process.exit(0)
  })
