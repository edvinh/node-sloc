const fs = require('graceful-fs')
const utils = require('./utils')

/**
 * @typedef {Object}  Options
 * @property {string} path             The path to walk.
 * @property {Array}  extensions       File extensions to look for.
 * @property {Array}  [ignorePaths]    A list of directories to ignore.
 * @param  {function} [logger]         Outputs extra information to this function if specified.
 */

/**
 * Async walks and counts SLOC in files in the given path.
 * @param  {Options} options           Options passed to the function.
 * @return {Promise}                   Resolves to an object containing SLOC and filepaths
 */
const walkAndCount = (options) => {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(options.path)) {
      reject('No such file or path. Exiting.')
    }

    if (fs.statSync(options.path).isFile()) {
      // If the file extension should be ignored, resolve with sloc: 0 and ignore the path
      if (!utils.fileAllowed(options.path, options.extensions)) {
        resolve({ paths: [], sloc: {} })
      }
      utils.countSloc(options.path).then((res) => {
        // If the path argument is a file, count it
        resolve({ paths: [options.path], sloc: Object.assign({}, res, { files: 1, loc: res.sloc + res.comments }) })
      })
    } else if (fs.statSync(options.path).isDirectory()) {
      utils.walk(options).then(res => {
        let promises = []
        let filteredPaths = utils.filterFiles(res, options.extensions)
        filteredPaths.forEach(fpath => {
          promises.push(utils.countSloc(fpath))
        })

        Promise.all(promises).then(values => {
          let totSloc = 0
          let totBlank = 0
          let totComments = 0
          let totFiles = filteredPaths.length
          values.forEach((value) => {
            totSloc += value.sloc
            totBlank += value.blank
            totComments += value.comments
          })
          resolve({
            paths: filteredPaths,
            sloc: {
              loc: totSloc + totComments,
              sloc: totSloc,
              blank: totBlank,
              comments: totComments,
              files: totFiles,
            },
          })
        }).catch(err => reject(`Error when walkning directory: ${err}`))
      }).catch(err => reject(`Error when walkning directory: ${err}`))
    }
  })
}

module.exports = {
  walkAndCount,
}
