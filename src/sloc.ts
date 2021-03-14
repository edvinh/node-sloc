import { FileSLOC, Options, SLOCResult } from './types'
import fs from 'graceful-fs'
import * as utils from './utils'

/**
 * @typedef  {Object}   Options
 * @property {string}   path             The path to walk.
 * @property {Array}    extensions       File extensions to look for.
 * @property {Array}    [ignorePaths]    A list of directories to ignore.
 * @property {boolean}  [ignoreDefault]  Whether or not to ignore the default extensions provided.
 * @param    {function} [logger]         Outputs extra information to this function if specified.
 */

/**
 * Async walks and counts SLOC in files in the given path.
 * @param  {Options} options            Options passed to the function.
 * @return {Promise}                    Resolves to an object containing SLOC and filepaths.
 *                                      Returns null if no files matched the given path.
 */
const walkAndCount = (options: Options): Promise<SLOCResult | null> => {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(options.path)) {
      reject('No such file or path. Exiting.')
    }

    if (fs.statSync(options.path).isFile()) {
      // If the file extension should be ignored, resolve with sloc: 0 and ignore the path
      if (!utils.fileAllowed(options.path, options.extensions || [])) {
        resolve(null)
      }
      utils.countSloc(options.path).then((res) => {
        // If the path argument is a file, count it
        resolve({
          paths: [options.path],
          sloc: { ...res, files: 1 },
        })
      })
    } else if (fs.statSync(options.path).isDirectory()) {
      utils
        .walk(options)
        .then((res) => {
          const promises: Promise<FileSLOC>[] = []
          const filteredPaths = utils.filterFiles(res, options.extensions || [])
          filteredPaths.forEach((fpath) => {
            promises.push(utils.countSloc(fpath))
          })

          Promise.all(promises)
            .then((values) => {
              const totFiles = filteredPaths.length

              const slocSum = values.reduce((acc, curr) => {
                return {
                  sloc: acc.sloc + curr.sloc,
                  loc: acc.loc + curr.loc,
                  blank: acc.blank + curr.blank,
                  comments: acc.comments + curr.comments,
                }
              })

              resolve({
                paths: filteredPaths,
                sloc: {
                  ...slocSum,
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

export { walkAndCount }
