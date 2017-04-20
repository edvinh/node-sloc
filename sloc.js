const fs = require('graceful-fs')
const utils = require('./utils')
const allowedExtensions = require('./file-extensions')

/**
 * Async walks and counts SLOC in files in the given directory.
 * @param  {string} filepath           The directory to walk.
 * @param  {Array} extraExtensions     Additional extensions.
 * @param  {Array} ignoredExtensions   Ignored extensions.
 * @return {Promise}                   Resolves to an array of filepaths.
 */
const walkAndCount = (filepath, extraExtensions, ignoredExtensions) => {
  const extensions = [...allowedExtensions, ...extraExtensions].filter(e => !ignoredExtensions.includes(e))
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(filepath)) {
      reject('No such file or directory. Exiting.')
    }

    if (fs.statSync(filepath).isFile()) {
      // If the file extension should be ignored, resolve with sloc: 0 and ignore the path
      if (!utils.fileAllowed(filepath, extensions)) {
        resolve({paths: [], sloc: 0})
      }
      utils.countSloc(filepath).then((res) => {
        // If the path argument is a file, count it
        resolve({paths: [filepath], sloc: res})
      })
    } else if (fs.statSync(filepath).isDirectory()) {
      utils.walk(filepath).then(res => {
        let promises = []
        let filteredPaths = utils.filterFiles(res, extensions)

        filteredPaths.forEach(fpath => {
          promises.push(utils.countSloc(fpath))
        })

        Promise.all(promises).then(values => {
          let totSloc = 0
          values.forEach((value) => totSloc += value)
          resolve({paths: res, sloc: totSloc})
        }).catch(err => reject(`Error when walkning directory: ${err}`))
      }).catch(err => reject(`Error when walkning directory: ${err}`))
    }
  })
}

module.exports = {
  walkAndCount,
}
