/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-env mocha */
import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'

import sloc from '../src'

const expect = chai.expect
chai.use(chaiAsPromised)

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
