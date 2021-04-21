import test from 'ava'
import nock = require('nock')
import jwt = require('jsonwebtoken')
import { Options } from '.'

import authenticate from './authenticate'

interface JwtAssertionBody {
  grantType: string
  assertion: string
}

// Setup

const expectedRefreshRequest =
  'grant_type=refresh_token&client_id=client1&client_secret=s3cr3t&' +
  'redirect_uri=https%3A%2F%2Fredirect.com%2Fhere&refresh_token=r3fr3sh'
const refreshResponse = {
  refresh_token: 'r3fr3sh',
  access_token: 't0k3n',
  expires_in: 21600,
}

const externalJwt =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'

const expectedClientRequest = 'grant_type=client_credentials'
const clientResponse = {
  access_token: externalJwt,
  expires_in: 21600,
  token_type: 'Bearer',
  scope: 'public-api',
}

const privateKey =
  '-----BEGIN PRIVATE KEY-----\n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\nselXjDSNvJn3jcRN9Obl5ACgM/texGI=\n-----END PRIVATE KEY-----'

const expectedJwtAssertionRequest = (body: unknown) => {
  if (
    typeof body === 'object' &&
    !!body &&
    (body as JwtAssertionBody).grantType ===
      'urn:ietf:params:oauth:grant-type:jwt-bearer' &&
    (body as JwtAssertionBody).assertion !== undefined
  ) {
    const selfsignedJwt = jwt.decode((body as JwtAssertionBody).assertion)
    return (
      typeof selfsignedJwt === 'object' &&
      !!selfsignedJwt &&
      selfsignedJwt.iss === 'client1' &&
      selfsignedJwt.aud === 'https://api.test/token' &&
      selfsignedJwt.scope === 'https://api.test/all'
    )
  }
  return false
}
const jwtAssertionResponse = {
  access_token: 't0k3nFr0mJWT',
  expires_in: 3599,
  token_type: 'Bearer',
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
      (type === 'client'
        ? expectedClientRequest
        : type === 'jwtAssertion'
        ? expectedJwtAssertionRequest
        : expectedRefreshRequest) + (includeScope ? '&scope=public-api' : '')
    )
    .reply(
      200,
      type === 'client'
        ? clientResponse
        : type === 'jwtAssertion'
        ? jwtAssertionResponse
        : refreshResponse
    )
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
  t.is(ret.token, externalJwt)
  t.true((ret.expire as number) >= expectedExpire)
  t.true((ret.expire as number) < expectedExpire + 1000)
  t.true(scope.isDone())
})

test('should authenticate with jwt-bearer credentials', async (t) => {
  const scope = nock('https://api7.test', {
    reqheaders: {
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
    },
  })
    .post('/token', expectedJwtAssertionRequest)
    .reply(200, jwtAssertionResponse)
  const options = {
    grantType: 'jwtAssertion' as const,
    uri: 'https://api7.test/token',
    key: 'client1',
    secret: privateKey,
    scope: 'https://api.test/all',
    audience: 'https://api.test/token',
    algorithm: 'RS256' as const,
    expiresIn: 3600,
  }
  const expectedExpire = Date.now() + 3599000

  const ret = await authenticate(options)

  t.is(ret.status, 'granted', ret.error)
  t.is(ret.token, 't0k3nFr0mJWT')
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
  t.is(ret.token, externalJwt)
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
