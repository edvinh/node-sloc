const sloc = require('./sloc')
const allowedExtensions = require('./file-extensions').map(x => x.lang)

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
 * @param  {Options} options     The options. See object options.
 * @param {Function} [callback]  The callback function, if node-style callbacks are preferred over promises.
 * @return {Promise}             If no callback is supplied, it returns a promise which will resolve to an object with properties `sloc` and `paths`.
 */
module.exports = (options, callback) => {
  // Check if options object is valid
  if (typeof options !== 'object' || !options) {
    return Promise.reject(new Error('Parameter `options` must be an object.'))
  }

  if (typeof options.path !== 'string') {
    return Promise.reject(new Error('`options.path` must be a string.'))
  }

  // if ignoreDefault is true, extensions must be supplied as well
  if (options.ignoreDefault && !options.extensions) {
    return Promise.reject(
      new Error('`options.extensions` must be supplied when ignoreDefault is set to true')
    )
  }

  let extensions = allowedExtensions
  let ignorePaths = options.ignorePaths || []
  if (options.extensions) {
    // Don't use the default extensions if ignoreDefault is true
    const ext = options.ignoreDefault ? [] : allowedExtensions
    extensions = [...ext, ...options.extensions]
  }

  // If no callback is provided, use promises
  if (!callback) {
    return sloc.walkAndCount({
      path: options.path,
      logger: options.logger,
      extensions,
      ignorePaths,
    })
  }

  // Else use node-style callback
  if (typeof callback !== 'function') {
    return new Error('type mismatch: callback must be a function')
  }

  sloc
    .walkAndCount({
      path: options.path,
      logger: options.logger,
      extensions,
      ignorePaths,
    })
    .then(res => callback(null, res))
    .catch(err => callback(err))

  return null
}
