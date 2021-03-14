export interface Options {
  /**  The path to walk. */
  path: string

  /** File extensions to look for. */
  extensions?: string[]

  /**  A list of directories to ignore. */
  ignorePaths?: string[]

  /** Whether or not to ignore the default extensions provided. */
  ignoreDefault?: boolean

  /** Outputs extra information to this function if specified. */
  logger?: (log: string) => void
}

export type Callback = (err: Error | null, result: SLOCResult | null) => void

export interface FileSLOC {
  /** Lines of code. */
  loc: number

  /** Source lines of code. */
  sloc: number

  /** Number of blank lines. */
  blank: number

  /** Number of lines of comments. */
  comments: number
}

export interface SLOC extends FileSLOC {
  /** Number of files checked. */
  files: number
}

export interface SLOCResult extends SLOC {
  /** Array of filepaths that have been checked. */
  paths: string[]
}

export interface FileExtension {
  /** The file extension language. */
  lang: string

  /** Comment syntax for the language. */
  comments: {
    line: string | null
    block: {
      start: string
      end: string
    } | null
  }
}
