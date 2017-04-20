const promisify = require('promisify-node')
const path = require('path')
const readline = require('readline')
const fs = promisify('graceful-fs')

/**
 * Walks the directory dir async and returns a promise which
 * resolves to an array of the filepaths.
 *
 * @param  {string} dir    The directory to walk
 * @return {Promise}       Resolves to an array of filepaths
 */
const walk = (dir) => {
  // TODO: Add ignorePaths
  return new Promise((resolve, reject) => {
    let results = []
    fs.readdir(dir).then((files) => {
      let len = files.length

      if (!len) {
        resolve(results)
      }

      files.forEach(file => {
        const dirFile = path.join(dir, file)

        fs.stat(dirFile).then((stat) => {
          if (stat.isFile()) {
            len--
            results.push(dirFile)

            if (!len) {
              resolve(results)
            }
          } else if (stat.isDirectory()) {
            walk(dirFile).then((res) => {
              len--
              results = results.concat(res)

              if (!len) {
                resolve(results)
              }
            })
          }
        }).catch((err) => reject(err))
      })
    }).catch((err) => reject(err))
  })
}

/**
 * Counts the source lines of code in the given file, specified by the filepath.
 *
 * @param  {string}  file  The filepath of the file to be read.
 * @return {Promise}       Resolves to an object containing the SLOC count.
 */
const countSloc = (file) => {
  return new Promise((resolve, reject) => {
    let sloc = 0
    const rl = readline.createInterface({
      input: fs.createReadStream(file),
    })

    rl.on('line', (line) => {
      // Exclude empty lines
      if (line.length > 0) {
        sloc++
      }
    })

    rl.on('error', (err) => reject(err))
    rl.on('close', () => resolve(sloc))
  })
}

/* Checks if a file extension is allowed. */
const fileAllowed = (file, extensions) => {
  const extension = file.split('.').pop() // get the file extension
  return extensions.includes(extension)   // check if it exists in the given array
}

/* Filters an array of filenames and returns a list of allowed files. */
const filterFiles = (files, extensions) => {
  return files.filter((file) => {
    return fileAllowed(file, extensions)
  })
}

module.exports = {
  walk,
  countSloc,
  filterFiles,
  fileAllowed,
}
