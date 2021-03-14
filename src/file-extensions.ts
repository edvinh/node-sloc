// All allowed file extensions

import { FileExtension } from './types'

const cStyleComments = { line: '//', block: { start: '/*', end: '*/' } }
const elixirStyleCommens = { line: '#', block: null }
const htmlStyleComments = { line: null, block: { start: '<!--', end: '-->' } }

const extensions: FileExtension[] = [
  {
    lang: 'as',
    comments: cStyleComments,
  },
  {
    lang: 'asm',
    comments: { line: ';', block: null },
  },
  {
    lang: 'c',
    comments: cStyleComments,
  },
  {
    lang: 'cc',
    comments: cStyleComments,
  },
  {
    lang: 'coffee',
    comments: { line: '#', block: { start: '###', end: '###' } },
  },
  {
    lang: 'cpp',
    comments: cStyleComments,
  },
  {
    lang: 'cs',
    comments: cStyleComments,
  },
  {
    lang: 'css',
    comments: { line: null, block: { start: '/*', end: '*/' } },
  },
  {
    lang: 'cxx',
    comments: cStyleComments,
  },
  {
    lang: 'elm',
    comments: { line: '--', block: { start: '{-', end: '-}' } },
  },
  {
    lang: 'erl',
    comments: { line: '%', block: null },
  },
  {
    lang: 'ex',
    comments: elixirStyleCommens,
  },
  {
    lang: 'eex',
    comments: elixirStyleCommens,
  },
  {
    lang: 'go',
    comments: cStyleComments,
  },
  {
    lang: 'groovy',
    comments: cStyleComments,
  },
  {
    lang: 'h',
    comments: cStyleComments,
  },
  {
    lang: 'hbs',
    comments: { line: null, block: { start: '{{!', end: '}}' } },
  },
  {
    lang: 'handlebars',
    comments: { line: null, block: { start: '{{!', end: '}}' } },
  },
  {
    lang: 'hpp',
    comments: cStyleComments,
  },
  {
    lang: 'hs',
    comments: { line: '--', block: null },
  },
  {
    lang: 'htm',
    comments: htmlStyleComments,
  },
  {
    lang: 'html',
    comments: htmlStyleComments,
  },
  {
    lang: 'hx',
    comments: cStyleComments,
  },
  {
    lang: 'hxx',
    comments: cStyleComments,
  },
  {
    lang: 'jade',
    comments: { line: '//', block: null },
  },
  {
    lang: 'java',
    comments: cStyleComments,
  },
  {
    lang: 'js',
    comments: cStyleComments,
  },
  {
    lang: 'jsx',
    comments: cStyleComments,
  },
  {
    lang: 'less',
    comments: cStyleComments,
  },
  {
    lang: 'lua',
    comments: { line: '--', block: { start: '--[[', end: ']]' } },
  },
  {
    lang: 'm',
    comments: cStyleComments,
  },
  {
    lang: 'mm',
    comments: cStyleComments,
  },
  {
    lang: 'mustache',
    comments: { line: null, block: { start: '{{!', end: '}}' } },
  },
  {
    lang: 'nut',
    comments: { line: '#', block: { start: '/*', end: '*/' } },
  },
  {
    lang: 'pl',
    comments: elixirStyleCommens,
  },
  {
    lang: 'php',
    comments: cStyleComments,
  },
  {
    lang: 'php5',
    comments: cStyleComments,
  },
  {
    lang: 'py',
    comments: { line: '#', block: { start: '"""', end: '"""' } },
  },
  {
    lang: 'rb',
    comments: { line: '#', block: { start: '=begin', end: '=end' } },
  },
  {
    lang: 'rs',
    comments: cStyleComments,
  },
  {
    lang: 'sass',
    comments: cStyleComments,
  },
  {
    lang: 'scala',
    comments: cStyleComments,
  },
  {
    lang: 'scss',
    comments: cStyleComments,
  },
  {
    lang: 'sh',
    comments: elixirStyleCommens,
  },
  {
    lang: 'styl',
    comments: cStyleComments,
  },
  {
    lang: 'swift',
    comments: cStyleComments,
  },
  {
    lang: 'ts',
    comments: cStyleComments,
  },
  {
    lang: 'tsx',
    comments: cStyleComments,
  },
  {
    lang: 'vb',
    comments: { line: "'", block: null },
  },
  {
    lang: 'xml',
    comments: htmlStyleComments,
  },
  {
    lang: 'yaml',
    comments: elixirStyleCommens,
  },
  {
    lang: 'yml',
    comments: elixirStyleCommens,
  },
]

export { cStyleComments, extensions }
