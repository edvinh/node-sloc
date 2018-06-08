const promisify = require('promisify-node')
const path = require('path')
const readline = require('readline')
const fs = promisify('graceful-fs')
const allowedExtensions = require('./file-extensions.js')

/**
 * Walks the directory dir async and returns a promise which
 * resolves to an array of the filepaths.
 *
 * @param  {string}   dir        The directory to walk
 * @param  {function} [logger]   The function outputs extra information to this function if specified.
 * @return {Promise}             Resolves to an array of filepaths
 */
const walk = options => {
  return new Promise((resolve, reject) => {
    let results = []
    fs.readdir(options.path)
      .then(files => {
        let len = files.length
        if (!len) {
          resolve(results)
        }

        files.forEach(file => {
          const dirFile = path.join(options.path, file)

          fs.stat(dirFile)
            .then(stat => {
              if (stat.isFile()) {
                len--
                results.push(dirFile)
                if (options.logger) {
                  options.logger(`Checking file: ${dirFile}`)
                }
                if (!len) {
                  resolve(results)
                }
              } else if (stat.isDirectory()) {
                if (options.ignorePaths) {
                  if (options.ignorePaths.includes(dirFile)) {
                    len--
                    if (!len) {
                      resolve(results)
                    }
                    return
                  }
                }
                walk(Object.assign({}, options, { path: dirFile })).then(res => {
                  len--
                  results = results.concat(res)

                  if (!len) {
                    resolve(results)
                  }
                })
              }
            })
            .catch(err => reject(err))
        })
      })
      .catch(err => reject(err))
  })
}

/**
 * Counts the source lines of code in the given file, specified by the filepath.
 *
 * @param  {string}  file  The filepath of the file to be read.
 * @return {Promise}       Resolves to an object containing the SLOC count.
 */
const countSloc = file => {
  return new Promise((resolve, reject) => {
    const extension = file
      .split('.')
      .pop()
      .toLowerCase() // get the file extension
    const comments = getCommentChars(extension) // eslint-disable-line
    let sloc = 0
    let numComments = 0
    let blankLines = 0
    let inMultiline = false
    const rl = readline.createInterface({
      input: fs.createReadStream(file),
    })

    rl.on('line', l => {
      const line = l.trim() // Trim the line to remove white space
      // Exclude empty lines
      if (line.length === 0) {
        blankLines++
        return
      }

      // Check if a multi-line comment (comment block) starts
      if (comments.multi && line.indexOf(comments.multi.start) === 0) {
        const commentEnd = line.indexOf(comments.multi.end)
        numComments++

        // Check if the mult-line comment ends at the same line
        if (commentEnd !== -1 && commentEnd !== 0) {
          return
        }

        inMultiline = !inMultiline
        return
      }

      // Check if we're in a multi-line comment and if the comment ends on this line
      if (inMultiline && line.indexOf(comments.multi.end) !== -1) {
        numComments++
        inMultiline = false
        return
      }

      if (inMultiline) {
        numComments++
        return
      }

      // Check if the line starts with a comment, exclude if true
      if (comments.line && line.indexOf(comments.line) === 0) {
        numComments++
        return
      }

      // No comments, increase the count
      sloc++
    })

    rl.on('error', err => reject(err))
    rl.on('close', () => resolve({ sloc: sloc, comments: numComments, blank: blankLines }))
  })
}

/* Checks if a file extension is allowed. */
const fileAllowed = (file, extensions) => {
  const extension = file
    .split('.')
    .pop()
    .toLowerCase() // get the file extension
  return extensions.includes(extension) // check if it exists in the given array
}

/* Filters an array of filenames and returns a list of allowed files. */
const filterFiles = (files, extensions) => {
  return files.filter(file => {
    return fileAllowed(file, extensions)
  })
}

const prettyPrint = obj => {
  const str = `
    +---------------------------------------------------+
    | SLOC                          | ${obj.sloc.sloc} \t\t|
    |-------------------------------|--------------------
    | Lines of comments             | ${obj.sloc.comments} \t\t|
    |-------------------------------|--------------------
    | Blank lines                   | ${obj.sloc.blank} \t\t|
    |-------------------------------|--------------------
    | Files counted                 | ${obj.sloc.files} \t\t|
    |-------------------------------|--------------------
    | Total LOC                     | ${obj.sloc.loc} \t\t|
    +---------------------------------------------------+
  `
  return str
}

/* Returns the comment syntax for specific languages */
function getCommentChars (extension) {
  const ext = allowedExtensions.find(x => x.lang === extension)

  if (ext) {
    return ext.comments
  } else {
    return {
      line: '//',
      multi: { start: '/*', end: '*/' },
    }
  }
}

module.exports = {
  walk,
  countSloc,
  filterFiles,
  fileAllowed,
  prettyPrint,
}
