import test from 'ava'

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

test('isAuthenticated should recognize authentications', (t) => {
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

  t.true(authenticator.isAuthenticated(authenticated, options, null))
  t.false(authenticator.isAuthenticated(expired, options, null))
  t.true(authenticator.isAuthenticated(noExpired, options, null))
  t.false(authenticator.isAuthenticated(unauthenticated, options, null))
  t.false(authenticator.isAuthenticated(refused, options, null))
  t.false(authenticator.isAuthenticated(null, options, null))
})

test('asObject should return token', (t) => {
  const authentication = {
    status: 'granted',
    token: 't0k3n',
    expire: Date.now() + 3600000,
  }
  const expected = {
    token: 't0k3n',
  }

  const ret = authenticator.authentication.asObject(authentication)

  t.deepEqual(ret, expected)
})

test('asObject should return empty object when not authenticated', (t) => {
  const authentication = {
    status: 'granted',
    token: 't0k3n',
    expire: Date.now() - 3600000,
  }
  const expected = {}

  const ret = authenticator.authentication.asObject(authentication)

  t.deepEqual(ret, expected)
})

test('asHttpHeaders should return token as Authorization header', (t) => {
  const authentication = {
    status: 'granted',
    token: 't0k3n',
    expire: Date.now() + 3600000,
  }
  const expected = {
    Authorization: 'Bearer t0k3n',
  }

  const ret = authenticator.authentication.asHttpHeaders(authentication)

  t.deepEqual(ret, expected)
})

test('asHttpHeaders should return empty object when not authenticated', (t) => {
  const authentication = {
    status: 'granted',
    token: 't0k3n',
    expire: Date.now() - 3600000,
  }
  const expected = {}

  const ret = authenticator.authentication.asHttpHeaders(authentication)

  t.deepEqual(ret, expected)
})

test('asHttpHeaders should support unbinded call to function', (t) => {
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

  t.deepEqual(ret, expected)
})
