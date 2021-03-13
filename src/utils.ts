import { FileExtension, Options, SLOC, SLOCResult } from './types'
import { extensions as allowedExtensions, cStyleComments } from './file-extensions'

import path from 'path'
import readline from 'readline'
import fs, { Stats } from 'graceful-fs'
import { promisify } from 'util'
import { isMatch } from 'micromatch'

const readdirAsync = promisify(fs.readdir)
const statAsync = promisify(fs.stat)

/**
 * Walks the directory dir async and returns a promise which
 * resolves to an array of the filepaths.
 *
 * @param  {string}   dir        The directory to walk
 * @param  {function} [logger]   The function outputs extra information to this function if specified.
 * @return {Promise}             Resolves to an array of filepaths
 */
const walk = (options: Options): Promise<string[]> => {
  return new Promise((resolve, reject) => {
    let results: string[] = []
    readdirAsync(options.path)
      .then((files: string[]) => {
        let len = files.length
        if (!len) {
          resolve(results)
        }

        files.forEach((file: string) => {
          const dirFile = path.join(options.path, file)

          if (isMatch(dirFile, options.ignorePaths || [])) {
            len--
            if (!len) {
              resolve(results)
            }

            return
          }

          statAsync(dirFile)
            .then((stat: Stats) => {
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
                if (isMatch(dirFile, options.ignorePaths || [])) {
                  len--
                  if (!len) {
                    resolve(results)
                  }
                  return
                }

                walk(Object.assign({}, options, { path: dirFile })).then((res) => {
                  len--
                  results = results.concat(res)

                  if (!len) {
                    resolve(results)
                  }
                })
              }
            })
            .catch((err: Error) => reject(err))
        })
      })
      .catch((err: Error) => reject(err))
  })
}

type PartialSLOC = Omit<SLOC, 'loc' | 'files'>

/**
 * Counts the source lines of code in the given file, specified by the filepath.
 *
 * @param  {string}  file  The filepath of the file to be read.
 * @return {Promise}       Resolves to an object containing the SLOC count.
 */
const countSloc = (file: string): Promise<PartialSLOC> => {
  return new Promise((resolve, reject) => {
    const extension = file.split('.').pop()?.toLowerCase() // get the file extension

    if (!extension) throw new Error(`No file extension on file: ${file}`)

    const comments = getCommentChars(extension)
    const { start, end } = comments.multi
    let sloc = 0
    let numComments = 0
    let blankLines = 0
    let inMultiline = false
    const rl = readline.createInterface({
      input: fs.createReadStream(file),
    })

    rl.on('line', (l: string) => {
      const line = l.trim() // Trim the line to remove white space
      // Exclude empty lines
      if (line.length === 0) {
        blankLines++
        return
      }

      // Check if a multi-line comment (comment block) starts
      if (start && end && line.startsWith(start)) {
        const commentEnd = line.indexOf(end)
        numComments++

        // Check if the multi-line comment ends at the same line
        if (commentEnd !== -1 && commentEnd !== 0) {
          return
        }

        inMultiline = !inMultiline
        return
      }

      // Check if we're in a multi-line comment and if the comment ends on this line
      if (inMultiline && end && line.indexOf(end) !== -1) {
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

    rl.on('error', (err: Error) => reject(err))
    rl.on('close', () => resolve({ sloc: sloc, comments: numComments, blank: blankLines }))
  })
}

/* Checks if a file extension is allowed. */
const fileAllowed = (file: string, extensions: string[]): boolean => {
  const extension = file.split('.').pop()?.toLowerCase() // get the file extension
  return extensions.includes(extension || '') // check if it exists in the given array
}

/* Filters an array of filenames and returns a list of allowed files. */
const filterFiles = (files: string[], extensions: string[]): string[] => {
  return files.filter((file: string) => {
    return fileAllowed(file, extensions)
  })
}

const prettyPrint = (obj: SLOCResult): string => {
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
function getCommentChars(extension: string): FileExtension['comments'] {
  const ext = allowedExtensions.find((x: FileExtension) => x.lang === extension)

  if (ext) {
    return ext.comments
  } else {
    return cStyleComments
  }
}

module.exports = {
  walk,
  countSloc,
  filterFiles,
  fileAllowed,
  prettyPrint,
}

export { walk, countSloc, filterFiles, fileAllowed, prettyPrint }
