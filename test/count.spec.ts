/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-env mocha */
import chai from 'chai'
import path from 'path'
import chaiAsPromised from 'chai-as-promised'

import sloc from '../src'

const expect = chai.expect
chai.use(chaiAsPromised)

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
