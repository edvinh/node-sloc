/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-env mocha */
import chai from 'chai'
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
      expect(result.then((o) => o)).to.eventually.have.property('sloc'),
      expect(result.then((o) => o)).to.eventually.have.property('loc'),
      expect(result.then((o) => o)).to.eventually.have.property('blank'),
      expect(result.then((o) => o)).to.eventually.have.property('comments'),
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
