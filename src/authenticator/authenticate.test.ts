import test from 'ava'
import nock = require('nock')

import authenticate from './authenticate'

// Setup

const expectedRequest = 'grant_type=refreshToken&client_id=client1&client_secret=s3cr3t&' +
  'redirect_uri=https%3A%2F%2Fredirect.com%2Fhere&refresh_token=r3fr3sh'

const setupNock = (baseUri: string) => {
  return nock(baseUri, {
    reqheaders: {
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
    }
  })
    .post('/token', expectedRequest)
    .reply(200, {
      refresh_token: 'r3fr3sh',
      access_token: 't0k3n',
      expires_in: 21600
    })
}

test.after.always(() => {
  nock.restore()
})

// Tests

test('should authenticate', async (t) => {
  const scope = setupNock('https://api1.test')
  const options = {
    apiUri: 'https://api1.test/token',
    clientId: 'client1',
    clientSecret: 's3cr3t',
    redirectUri: 'https://redirect.com/here',
    refreshToken: 'r3fr3sh'
  }
  const expectedExpire = Date.now() + 21600000

  const ret = await authenticate(options)

  t.is(ret.status, 'granted')
  t.is(ret.token, 't0k3n')
  t.true((ret.expire as number) >= expectedExpire)
  t.true((ret.expire as number) < expectedExpire + 1000)
  t.true(scope.isDone())
})

test('should not authenticate with missing options', async (t) => {
  const options = {}

  const ret = await authenticate(options)

  t.is(ret.status, 'error')
  t.is(typeof ret.error, 'string')
})

test('should return refused on authentication error', async (t) => {
  const scope = nock('https://api2.test')
    .post('/token')
    .reply(400, {
      error: '400',
      error_description: 'Awful error'
    })
  const options = {
    apiUri: 'https://api2.test/token',
    clientId: 'client1',
    clientSecret: 's3cr3t',
    redirectUri: 'https://redirect.com/here',
    refreshToken: 'r3fr3sh'
  }

  const ret = await authenticate(options)

  t.is(ret.status, 'refused')
  t.true(scope.isDone())
})

test('should return error when apiUrl not found', async (t) => {
  const scope = nock('https://api3.test')
    .post('/token')
    .reply(404)
  const options = {
    apiUri: 'https://api3.test/token',
    clientId: 'client1',
    clientSecret: 's3cr3t',
    redirectUri: 'https://redirect.com/here',
    refreshToken: 'r3fr3sh'
  }

  const ret = await authenticate(options)

  t.is(ret.status, 'error')
  t.is(typeof ret.error, 'string')
  t.true(scope.isDone())
})

test('should return error when json response is not valid', async (t) => {
  const scope = nock('https://api4.test')
    .post('/token')
    .reply(200)
  const options = {
    apiUri: 'https://api4.test/token',
    clientId: 'client1',
    clientSecret: 's3cr3t',
    redirectUri: 'https://redirect.com/here',
    refreshToken: 'r3fr3sh'
  }

  const ret = await authenticate(options)

  t.is(ret.status, 'error')
  t.is(typeof ret.error, 'string')
  t.true(scope.isDone())
})
