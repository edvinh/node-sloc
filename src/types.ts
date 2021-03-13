export interface Options {
  path: string
  extensions?: string[]
  ignorePaths?: string[]
  ignoreDefault?: boolean
  logger?: (log: string) => void
}

export type Callback = (err: Error | null, result?: SLOCResult) => void

export interface SLOC {
  loc?: number
  sloc?: number
  blank?: number
  comments?: number
  files?: number
}

export interface SLOCResult {
  paths: string[]
  sloc: SLOC
}

export interface FileExtension {
  lang: string
  comments: {
    line: string | null
    multi: {
      start: string | null
      end: string | null
    }
  }
}
