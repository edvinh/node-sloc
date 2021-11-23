import { FileExtension, FileSLOC, Options, SLOCResult } from './types'
import { extensions as allowedExtensions, cStyleComments } from './file-extensions'

import path from 'path'
import readline from 'readline'
import fs from 'graceful-fs'
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
      .then((files) => {
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
            .then((stat) => {
              if (stat.isFile()) {
                len--
                results.push(dirFile)
                options.logger?.(`Checking file: ${dirFile}`)
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
                walk({ ...options, path: dirFile }).then((res) => {
                  len--
                  results = results.concat(res)
                  if (!len) {
                    resolve(results)
                  }
                })
              }
            })
            .catch((err) => reject(err))
        })
      })
      .catch((err) => reject(err))
  })
}

/**
 * Counts the source lines of code in the given file, specified by the filepath.
 *
 * @param  {string}  file  The filepath of the file to be read.
 * @return {Promise}       Resolves to an object containing the SLOC count.
 */
const countSloc = (file: string): Promise<FileSLOC> => {
  return new Promise((resolve, reject) => {
    const extension = file.split('.').pop()?.toLowerCase() // get the file extension

    if (!extension) throw new Error(`No file extension on file: ${file}`)

    const comments = getCommentChars(extension)
    const { start, end } = comments.block || {}
    let sloc = 0
    let numComments = 0
    let blankLines = 0
    let inBlock = false
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

      // Check if a comment block starts
      if (start && end && line.startsWith(start)) {
        const commentEnd = line.indexOf(end)
        numComments++

        // Check if the comment block ends at the same line
        if (commentEnd !== -1 && commentEnd !== 0) {
          return
        }

        // Special case for when block comment tokens are identical
        if (start === end) {
          inBlock = !inBlock
          return
        }

        inBlock = true
        return
      }

      // Check if we're in a comment block and if the comment ends on this line
      if (inBlock && end && line.indexOf(end) !== -1) {
        numComments++
        inBlock = false
        return
      }

      if (inBlock) {
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

    rl.on('error', (err) => reject(err))
    rl.on('close', () =>
      resolve({
        sloc: sloc,
        comments: numComments,
        blank: blankLines,
        loc: numComments + sloc,
      })
    )
  })
}

/* Checks if a file extension is allowed. */
const fileExtensionAllowed = (file: string, extensions: string[]): boolean => {
  return extensions.some((extension) => file.endsWith(extension))
}

/* Filters an array of filenames and returns a list of allowed files. */
const filterFiles = (files: string[], extensions: string[]): string[] => {
  return files.filter((file: string) => {
    return fileExtensionAllowed(file, extensions)
  })
}

const prettyPrint = (obj: SLOCResult): string => {
  const str = `
    +---------------------------------------------------+
    | SLOC                          | ${obj.sloc} \t\t|
    |-------------------------------|--------------------
    | Lines of comments             | ${obj.comments} \t\t|
    |-------------------------------|--------------------
    | Blank lines                   | ${obj.blank} \t\t|
    |-------------------------------|--------------------
    | Files counted                 | ${obj.files} \t\t|
    |-------------------------------|--------------------
    | Total LOC                     | ${obj.loc} \t\t|
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

export { walk, countSloc, filterFiles, fileExtensionAllowed, prettyPrint }
