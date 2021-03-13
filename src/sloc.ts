import { Options, SLOC, SLOCResult } from './types'
import fs from 'graceful-fs'
import * as utils from './utils'

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
const walkAndCount = (options: Options): Promise<SLOCResult> => {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(options.path)) {
      reject('No such file or path. Exiting.')
    }

    if (fs.statSync(options.path).isFile()) {
      // If the file extension should be ignored, resolve with sloc: 0 and ignore the path
      if (!utils.fileAllowed(options.path, options.extensions || [])) {
        resolve({ paths: [], sloc: {} })
      }
      utils.countSloc(options.path).then((res) => {
        // If the path argument is a file, count it
        resolve({
          paths: [options.path],
          sloc: { ...res, files: 1, loc: (res.sloc || 0) + (res.comments || 0) },
          // sloc: Object.assign({}, res, { files: 1, loc: res.sloc + res.comments }),
        })
      })
    } else if (fs.statSync(options.path).isDirectory()) {
      utils
        .walk(options)
        .then((res) => {
          const promises: Promise<SLOC>[] = []
          const filteredPaths = utils.filterFiles(res, options.extensions || [])
          filteredPaths.forEach((fpath) => {
            promises.push(utils.countSloc(fpath))
          })

          Promise.all(promises)
            .then((values) => {
              let totSloc = 0
              let totBlank = 0
              let totComments = 0
              const totFiles = filteredPaths.length
              values.forEach((value) => {
                totSloc += value.sloc || 0
                totBlank += value.blank || 0
                totComments += value.comments || 0
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
            })
            .catch((err) => reject(`Error when walking directory: ${err}`))
        })
        .catch((err) => reject(`Error when walking directory: ${err}`))
    }
  })
}

module.exports = {
  walkAndCount,
}

export { walkAndCount }
