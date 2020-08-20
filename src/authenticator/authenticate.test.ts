import test from 'ava'
import nock = require('nock')
import { Options } from '.'

import authenticate from './authenticate'

// Setup

const expectedRefreshRequest =
  'grant_type=refresh_token&client_id=client1&client_secret=s3cr3t&' +
  'redirect_uri=https%3A%2F%2Fredirect.com%2Fhere&refresh_token=r3fr3sh'
const refreshResponse = {
  refresh_token: 'r3fr3sh',
  access_token: 't0k3n',
  expires_in: 21600,
}

const jwt =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'

const expectedClientRequest = 'grant_type=client_credentials'
const clientResponse = {
  access_token: jwt,
  expires_in: 21600,
  token_type: 'Bearer',
  scope: 'public-api',
}

const setupNock = (uri: string, type = 'refresh', includeScope = false) => {
  return nock(uri, {
    reqheaders: {
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
      ...(type === 'client'
        ? { Authorization: 'Basic Y2xpZW50MTpzM2NyM3Q=' }
        : {}),
    },
  })
    .post(
      '/token',
      (type === 'client' ? expectedClientRequest : expectedRefreshRequest) +
        (includeScope ? '&scope=public-api' : '')
    )
    .reply(200, type === 'client' ? clientResponse : refreshResponse)
}

test.after.always(() => {
  nock.restore()
})

// Tests

test('should authenticate with refresh token', async (t) => {
  const scope = setupNock('https://api1.test')
  const options = {
    grantType: 'refreshToken' as const,
    uri: 'https://api1.test/token',
    key: 'client1',
    secret: 's3cr3t',
    redirectUri: 'https://redirect.com/here',
    refreshToken: 'r3fr3sh',
  }
  const expectedExpire = Date.now() + 21600000

  const ret = await authenticate(options)

  t.is(ret.status, 'granted', ret.error)
  t.is(ret.token, 't0k3n')
  t.true((ret.expire as number) >= expectedExpire)
  t.true((ret.expire as number) < expectedExpire + 1000)
  t.true(scope.isDone())
})

test('should authenticate with client credentials', async (t) => {
  const scope = setupNock('https://api5.test', 'client')
  const options = {
    grantType: 'clientCredentials' as const,
    uri: 'https://api5.test/token',
    key: 'client1',
    secret: 's3cr3t',
  }
  const expectedExpire = Date.now() + 21600000

  const ret = await authenticate(options)

  t.is(ret.status, 'granted', ret.error)
  t.is(ret.token, jwt)
  t.true((ret.expire as number) >= expectedExpire)
  t.true((ret.expire as number) < expectedExpire + 1000)
  t.true(scope.isDone())
})

test('should include scope in grant request', async (t) => {
  const scope = setupNock('https://api6.test', 'client', true)
  const options = {
    grantType: 'clientCredentials' as const,
    uri: 'https://api6.test/token',
    key: 'client1',
    secret: 's3cr3t',
    scope: 'public-api',
  }
  const expectedExpire = Date.now() + 21600000

  const ret = await authenticate(options)

  t.is(ret.status, 'granted', ret.error)
  t.is(ret.token, jwt)
  t.true((ret.expire as number) >= expectedExpire)
  t.true((ret.expire as number) < expectedExpire + 1000)
  t.true(scope.isDone())
})

test('should not authenticate with missing options', async (t) => {
  const options = {} as Options

  const ret = await authenticate(options)

  t.is(ret.status, 'error')
  t.is(typeof ret.error, 'string')
})

test('should return refused on authentication error', async (t) => {
  const scope = nock('https://api2.test').post('/token').reply(400, {
    error: '400',
    error_description: 'Awful error',
  })
  const options = {
    grantType: 'refreshToken' as const,
    uri: 'https://api2.test/token',
    key: 'client1',
    secret: 's3cr3t',
    redirectUri: 'https://redirect.com/here',
    refreshToken: 'r3fr3sh',
  }

  const ret = await authenticate(options)

  t.is(ret.status, 'refused')
  t.true(scope.isDone())
})

test('should return error when apiUrl not found', async (t) => {
  const scope = nock('https://api3.test').post('/token').reply(404)
  const options = {
    grantType: 'refreshToken' as const,
    uri: 'https://api3.test/token',
    key: 'client1',
    secret: 's3cr3t',
    redirectUri: 'https://redirect.com/here',
    refreshToken: 'r3fr3sh',
  }

  const ret = await authenticate(options)

  t.is(ret.status, 'error')
  t.is(typeof ret.error, 'string')
  t.true(scope.isDone())
})

test('should return error when json response is not valid', async (t) => {
  const scope = nock('https://api4.test').post('/token').reply(200)
  const options = {
    grantType: 'refreshToken' as const,
    uri: 'https://api4.test/token',
    key: 'client1',
    secret: 's3cr3t',
    redirectUri: 'https://redirect.com/here',
    refreshToken: 'r3fr3sh',
  }

  const ret = await authenticate(options)

  t.is(ret.status, 'error')
  t.is(typeof ret.error, 'string')
  t.true(scope.isDone())
})
