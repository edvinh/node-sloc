/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-env mocha */
import chai from 'chai'
import path from 'path'
import chaiAsPromised from 'chai-as-promised'

import sloc from '../src'

const expect = chai.expect
chai.use(chaiAsPromised)

describe('Result Properties', () => {
  it('should have correct properties', () => {
    const options = {
      path: 'test/test_assets',
    }

    const result = sloc(options)

    return Promise.all([
      expect(result.then((o) => o)).to.eventually.have.property('paths'),
      expect(result.then((o) => o.sloc)).to.eventually.have.property('sloc'),
      expect(result.then((o) => o.sloc)).to.eventually.have.property('loc'),
      expect(result.then((o) => o.sloc)).to.eventually.have.property('blank'),
      expect(result.then((o) => o.sloc)).to.eventually.have.property('comments'),
    ])
  })

  it("should reject promise when parameter isn't an object", () => {
    const options = 'str'

    // @ts-ignore
    const result = sloc(options)
    return expect(result).to.be.rejected
  })

  it('should reject promise when path is not supplied', () => {
    const options = {}

    // @ts-ignore
    const result = sloc(options)
    return expect(result).to.be.rejected
  })

  it('should reject promise when ignoreDefault is true but extensions is not supplied', () => {
    const options = {
      path: 'test/test_assets',
      ignoreDefault: true,
    }

    const result = sloc(options)
    return expect(result).to.be.rejected
  })

  it('should call callback when providing callback function', (done) => {
    const options = {
      path: 'test/test_assets/file.c',
    }

    const callback = (err) => {
      if (err) {
        done(err)
      } else {
        done()
      }
    }

    sloc(options, callback)
  })

  it("should throw error when callback isn't a function", () => {
    const options = {
      path: 'test/test_assets/file.c',
    }

    // @ts-ignore
    const err = () => sloc(options, 'callback')
    return expect(err).to.throw
  })
})

describe('Count', () => {
  it("should reject promise when path doesn't exist", () => {
    const options = {
      path: 'non/existant/path',
    }

    const result = sloc(options)
    return expect(result).to.be.rejected
  })

  it('should return null when ignoring file type', () => {
    const options = {
      path: 'test/test_assets/file.c',
      ignoreDefault: true,
      extensions: ['other-file-extension'],
    }

    const result = sloc(options)
    return expect(result).to.eventually.eql(null)
  })

  it('should be able to exclude nested directories', () => {
    const options = {
      path: 'test/test_assets',
      ignorePaths: [`test${path.sep}test_assets${path.sep}lang`],
    }

    const result = sloc(options)
    return result.then((res) => {
      return expect(res.sloc.files).to.eql(4)
    })
  })

  it('should be able to exclude paths specified with a glob pattern', () => {
    const options = {
      path: 'test/test_assets',
      ignorePaths: ['**/file.*', 'multipleblockstarts*'],
      extensions: ['qq'],
    }

    const result = sloc(options)
    return result.then((res) => {
      return expect(res.sloc.files).to.eql(4)
    })
  })

  it('should count SLOC, comments and blank lines correctly', () => {
    const options = {
      path: 'test/test_assets/file.c',
    }

    const result = sloc(options)
    return expect(result).to.eventually.eql({
      paths: ['test/test_assets/file.c'],
      sloc: {
        sloc: 47,
        comments: 16,
        blank: 7,
        files: 1,
        loc: 63,
      },
    })
  })

  it('should be able to handle files with only comments', () => {
    const options = {
      path: 'test/test_assets/onlycomments.c',
    }

    const result = sloc(options)
    return expect(result).to.eventually.eql({
      paths: ['test/test_assets/onlycomments.c'],
      sloc: {
        sloc: 0,
        comments: 66,
        blank: 0,
        files: 1,
        loc: 66,
      },
    })
  })

  it('should be able to handle empty files', () => {
    const options = {
      path: 'test/test_assets/empty.c',
    }

    const result = sloc(options)
    return expect(result).to.eventually.eql({
      paths: ['test/test_assets/empty.c'],
      sloc: {
        sloc: 0,
        comments: 0,
        blank: 0,
        files: 1,
        loc: 0,
      },
    })
  })

  it('should be able to handle other extensions', () => {
    const options = {
      path: 'test/test_assets/otherextension.qq',
      ignoreDefault: true,
      extensions: ['qq'],
    }

    const result = sloc(options)
    return expect(result).to.eventually.eql({
      paths: ['test/test_assets/otherextension.qq'],
      sloc: {
        sloc: 3,
        comments: 6,
        blank: 0,
        files: 1,
        loc: 9,
      },
    })
  })

  it('should count correctly when using callback and nested paths', (done) => {
    const options = {
      path: 'test/test_assets',
      ignorePaths: ['test/test_assets/lang', '**/multipleblockstarts*'],
      extensions: ['qq'],
    }

    const callback = (err, res) => {
      if (err) {
        done(err)
      } else {
        try {
          expect(res.sloc).to.be.eql({
            sloc: 50,
            comments: 88,
            blank: 7,
            files: 4,
            loc: 138,
          })
          done()
        } catch (e) {
          done(e)
        }
      }
    }

    sloc(options, callback)
  })

  it('should be able to parse multiple block comment start token occurrences in same comment block', () => {
    const options = {
      path: 'test/test_assets/multipleblockstarts.c',
    }

    const result = sloc(options)
    expect(result).to.eventually.have.nested.property('sloc.sloc', 3)
    expect(result).to.eventually.have.nested.property('sloc.comments', 5)
  })
})

describe('Comment parsing', () => {
  it('should be able to parse html style comments', () => {
    const options = {
      path: 'test/test_assets/lang/file.html',
    }

    const result = sloc(options)
    return expect(result).to.eventually.eql({
      paths: ['test/test_assets/lang/file.html'],
      sloc: {
        sloc: 8,
        comments: 5,
        blank: 2,
        files: 1,
        loc: 13,
      },
    })
  })

  it('should be able to parse elixir style comments', () => {
    const options = {
      path: 'test/test_assets/lang/file.ex',
    }

    const result = sloc(options)
    return expect(result).to.eventually.eql({
      paths: ['test/test_assets/lang/file.ex'],
      sloc: {
        sloc: 4,
        comments: 4,
        blank: 2,
        files: 1,
        loc: 8,
      },
    })
  })

  it('should be able to parse python comments', () => {
    const options = {
      path: 'test/test_assets/lang/file.py',
    }

    const result = sloc(options)
    return expect(result).to.eventually.eql({
      paths: ['test/test_assets/lang/file.py'],
      sloc: {
        sloc: 6,
        comments: 5,
        blank: 0,
        files: 1,
        loc: 11,
      },
    })
  })

  it('should be able to parse lua comments', () => {
    const options = {
      path: 'test/test_assets/lang/file.lua',
    }

    const result = sloc(options)
    return expect(result).to.eventually.eql({
      paths: ['test/test_assets/lang/file.lua'],
      sloc: {
        sloc: 6,
        comments: 5,
        blank: 0,
        files: 1,
        loc: 11,
      },
    })
  })

  it('should be able to parse squirrel comments', () => {
    const options = {
      path: 'test/test_assets/lang/file.nut',
    }

    const result = sloc(options)
    return expect(result).to.eventually.eql({
      paths: ['test/test_assets/lang/file.nut'],
      sloc: {
        sloc: 2,
        comments: 5,
        blank: 0,
        files: 1,
        loc: 7,
      },
    })
  })

  it('should be able to parse coffeescript comments', () => {
    const options = {
      path: 'test/test_assets/lang/file.coffee',
    }

    const result = sloc(options)
    return expect(result).to.eventually.eql({
      paths: ['test/test_assets/lang/file.coffee'],
      sloc: {
        sloc: 7,
        comments: 8,
        blank: 4,
        files: 1,
        loc: 15,
      },
    })
  })

  it('should be able to parse ruby comments', () => {
    const options = {
      path: 'test/test_assets/lang/file.rb',
    }

    const result = sloc(options)
    return expect(result).to.eventually.eql({
      paths: ['test/test_assets/lang/file.rb'],
      sloc: {
        sloc: 12,
        comments: 5,
        blank: 2,
        files: 1,
        loc: 17,
      },
    })
  })

  it('should be able to parse haskell comments', () => {
    const options = {
      path: 'test/test_assets/lang/file.hs',
    }

    const result = sloc(options)
    return expect(result).to.eventually.eql({
      paths: ['test/test_assets/lang/file.hs'],
      sloc: {
        sloc: 8,
        comments: 2,
        blank: 0,
        files: 1,
        loc: 10,
      },
    })
  })

  it('should be able to parse mustache comments', () => {
    const options = {
      path: 'test/test_assets/lang/file.mustache',
    }

    const result = sloc(options)
    return expect(result).to.eventually.eql({
      paths: ['test/test_assets/lang/file.mustache'],
      sloc: {
        sloc: 6,
        comments: 5,
        blank: 0,
        files: 1,
        loc: 11,
      },
    })
  })

  it('should be able to parse handlebars comments', () => {
    const options = {
      path: 'test/test_assets/lang/file.hbs',
    }

    const result = sloc(options)
    return expect(result).to.eventually.eql({
      paths: ['test/test_assets/lang/file.hbs'],
      sloc: {
        sloc: 6,
        comments: 5,
        blank: 1,
        files: 1,
        loc: 11,
      },
    })
  })

  it('should be able to parse erlang comments', () => {
    const options = {
      path: 'test/test_assets/lang/file.erl',
    }

    const result = sloc(options)
    return expect(result).to.eventually.eql({
      paths: ['test/test_assets/lang/file.erl'],
      sloc: {
        sloc: 2,
        comments: 3,
        blank: 0,
        files: 1,
        loc: 5,
      },
    })
  })

  it('should be able to parse perl comments', () => {
    const options = {
      path: 'test/test_assets/lang/file.pl',
    }

    const result = sloc(options)
    return expect(result).to.eventually.eql({
      paths: ['test/test_assets/lang/file.pl'],
      sloc: {
        sloc: 3,
        comments: 2,
        blank: 0,
        files: 1,
        loc: 5,
      },
    })
  })

  it('should be able to parse elm comments', () => {
    const options = {
      path: 'test/test_assets/lang/file.elm',
    }

    const result = sloc(options)
    return expect(result).to.eventually.eql({
      paths: ['test/test_assets/lang/file.elm'],
      sloc: {
        sloc: 5,
        comments: 6,
        blank: 4,
        files: 1,
        loc: 11,
      },
    })
  })
})
