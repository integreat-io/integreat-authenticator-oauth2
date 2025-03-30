import test from 'node:test'
import assert from 'node:assert/strict'

import authenticator from './index.js'

// Set up

const options = {
  grantType: 'authorizationCode' as const,
  uri: 'https://api1.test/token',
  key: 'client1',
  secret: 's3cr3t',
  redirectUri: 'https://redirect.com/here',
  code: '4Uthc0d3',
}

// Tests

test('isAuthenticated should recognize authentications', () => {
  const authenticated = {
    status: 'granted',
    token: 't0k3n',
    expire: Date.now() + 3600000,
  }
  const expired = {
    status: 'granted',
    token: 't0k3n',
    expire: Date.now() - 3600000,
  }
  const noExpired = { status: 'granted', token: 't0k3n' }
  const unauthenticated = { status: 'granted' }
  const refused = {
    status: 'refused',
    token: 't0k3n',
    expire: Date.now() + 3600000,
  }

  assert.equal(
    authenticator.isAuthenticated(authenticated, options, null),
    true,
  )
  assert.equal(authenticator.isAuthenticated(expired, options, null), false)
  assert.equal(authenticator.isAuthenticated(noExpired, options, null), true)
  assert.equal(
    authenticator.isAuthenticated(unauthenticated, options, null),
    false,
  )
  assert.equal(authenticator.isAuthenticated(refused, options, null), false)
  assert.equal(authenticator.isAuthenticated(null, options, null), false)
})

test('asObject should return token', () => {
  const authentication = {
    status: 'granted',
    token: 't0k3n',
    expire: Date.now() + 3600000,
  }
  const expected = {
    token: 't0k3n',
  }

  const ret = authenticator.authentication.asObject(authentication)

  assert.deepEqual(ret, expected)
})

test('asObject should return empty object when not authenticated', () => {
  const authentication = {
    status: 'granted',
    token: 't0k3n',
    expire: Date.now() - 3600000,
  }
  const expected = {}

  const ret = authenticator.authentication.asObject(authentication)

  assert.deepEqual(ret, expected)
})

test('asHttpHeaders should return token as Authorization header', () => {
  const authentication = {
    status: 'granted',
    token: 't0k3n',
    expire: Date.now() + 3600000,
  }
  const expected = {
    Authorization: 'Bearer t0k3n',
  }

  const ret = authenticator.authentication.asHttpHeaders(authentication)

  assert.deepEqual(ret, expected)
})

test('asHttpHeaders should return token as Authorization header with other token type', () => {
  const authentication = {
    status: 'granted',
    token: 't0k3n',
    type: 'Basic',
    expire: Date.now() + 3600000,
  }
  const expected = {
    Authorization: 'Basic t0k3n',
  }

  const ret = authenticator.authentication.asHttpHeaders(authentication)

  assert.deepEqual(ret, expected)
})

test('asHttpHeaders should return token as Authorization header with no token type', () => {
  const authentication = {
    status: 'granted',
    token: 't0k3n',
    type: '',
    expire: Date.now() + 3600000,
  }
  const expected = {
    Authorization: 't0k3n',
  }

  const ret = authenticator.authentication.asHttpHeaders(authentication)

  assert.deepEqual(ret, expected)
})

test('asHttpHeaders should return empty object when not authenticated', () => {
  const authentication = {
    status: 'granted',
    token: 't0k3n',
    expire: Date.now() - 3600000,
  }
  const expected = {}

  const ret = authenticator.authentication.asHttpHeaders(authentication)

  assert.deepEqual(ret, expected)
})

test('asHttpHeaders should support unbinded call to function', () => {
  const authentication = {
    status: 'granted',
    token: 't0k3n',
    expire: Date.now() + 3600000,
  }
  const expected = {
    Authorization: 'Bearer t0k3n',
  }
  const { asHttpHeaders } = authenticator.authentication

  const ret = asHttpHeaders(authentication)

  assert.deepEqual(ret, expected)
})
