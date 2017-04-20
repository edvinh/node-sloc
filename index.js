const sloc = require('./sloc')
const allowedExtensions = require('./file-extensions')

/**
 * @typedef  {Object}      Options
 * @property {string}      path               The path to walk or file to read.
 * @property {Array}       [extensions]       Additional file extensions to look for.
 * @property {Array}       [ignorePaths]      A list of directories to ignore.
 * @property {boolean}     [ignoreDefault]    Ignores the default file extensions.
 * @property {function}    [logger]           Outputs extra information to this function if specified.
 */

/**
 * Reads a specified file/directory and counts the SLOC.
 * If a directory is supplied the function will walk the directory recursively and count the SLOC.
 * @param  {Options} options   The options. See object options.
 * @return {Promise}           Returns a promise which will resolve to an object with properties `sloc` and `paths`.
 */
module.exports = (options) => {

  // Check if options object is valid
  if (typeof options !== 'object' || !options) {
    return Promise.reject(new Error('Parameter `options` must be an object.'))
  }

  if (typeof options.path !== 'string') {
    return Promise.reject(new Error('`options.path` must be a string.'))
  }

  // if ignoreDefault is true, extensions must be supplied as well
  if (options.ignoreDefault && !options.extensions) {
    return Promise.reject(new Error('`options.extensions` must be supplied when ignoreDefault is set to true'))
  }

  let extensions = allowedExtensions
  let ignorePaths = options.ignorePaths || []
  if (options.extensions) {
    extensions = [...allowedExtensions, ...options.extensions]
  }

  return sloc.walkAndCount({
    path: options.path,
    logger: options.logger,
    extensions,
    ignorePaths,
  })
}
