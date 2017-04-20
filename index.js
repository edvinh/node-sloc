#! /usr/bin/env node

const chalk = require('chalk')
const args = require('minimist')(process.argv.slice(2))
const sloc = require('./sloc')
const utils = require('./utils')
const allowedExtensions = require('./file-extensions')

const info = chalk.bold.blue
const output = chalk.bold.gray
const error = chalk.bold.red
const result = chalk.bold.green

const helpText = `
  usage:
             node-sloc [path] [options]
  options:
             -h, --help                   Prints usage information (the one you're reading right now)

             -l, --list-extensions        Lists all default file extensions

             -e, --extra-extensions       Include non-default file extensions,
                                          specified by a comma separated string of extensions

             -i, --ignore-extensions      Include list of file extensions to ignore,
                                          specified by a comma separated string of extensions

              -v, --verbose               Output extra information during execution

  examples:
             node-sloc "../app"
             node-sloc "../app" --extra-extensions "aaa, bbb, ccc" --ignore-extensions "xml, yaml"
             node-sloc file.js
   `

let extraExtensions = []
let ignoredExtensions = []

const handleExtensionString = (param, shorthand) => {
  let arg = args[param] || args[shorthand]
  if (!arg) {
    console.log(error(`Missing argument for --${param}`))
    process.exit(0)
  }
  return arg.replace(/ |\./g, '').split(',')
}

// Help argument
if (args.help || args.h) {
  console.log(helpText)
  process.exit(0)
}

// List extensions argument
if (args['list-extensions'] || args.l) {
  console.log('Supported file extensions:\n', `.${allowedExtensions.join('\n .')}`)
  process.exit(0)
}

// Path argument
if (args._.length === 0) {
  console.log(error('No file or directory specified. Exiting.\n'), helpText)
  process.exit(0)
}

// Extra extensions argument
if (args['extra-extensions'] || args.e) {
  extraExtensions = handleExtensionString('extra-extensions', 'e')
}

// Extra extensions argument
if (args['ignore-extensions'] || args.i) {
  ignoredExtensions = handleExtensionString('ignore-extensions', 'i')
}

const filepath = args._[0]

console.log(info('Reading file(s)...'))

sloc.walkAndCount(filepath, extraExtensions, ignoredExtensions).then((res) => {
  // This needs some refactoring...
  const filteredExtensions = [...allowedExtensions, ...extraExtensions].filter(e => !ignoredExtensions.includes(e))
  const paths = utils.filterFiles(res.paths, filteredExtensions)
  if (args.verbose || args.v) {
    console.log(info('Counted the following files: '))
    console.log(output(paths.join('\n')))
  }
  console.log(result('SLOC: ', res.sloc))
}).catch(err => {
  console.log(error(err))
  process.exit(0)
})
