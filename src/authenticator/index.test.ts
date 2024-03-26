import test from 'ava'

import authenticator from '.'

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

  t.true(authenticator.isAuthenticated(authenticated))
  t.false(authenticator.isAuthenticated(expired))
  t.true(authenticator.isAuthenticated(noExpired))
  t.false(authenticator.isAuthenticated(unauthenticated))
  t.false(authenticator.isAuthenticated(refused))
  t.false(authenticator.isAuthenticated(null))
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

  const ret = authenticator.asObject(authentication)

  t.deepEqual(ret, expected)
})

test('asObject should return empty object when not authenticated', (t) => {
  const authentication = {
    status: 'granted',
    token: 't0k3n',
    expire: Date.now() - 3600000,
  }
  const expected = {}

  const ret = authenticator.asObject(authentication)

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

  const ret = authenticator.asHttpHeaders(authentication)

  t.deepEqual(ret, expected)
})

test('asHttpHeaders should return token as Authorization header with other token type', (t) => {
  const authentication = {
    status: 'granted',
    token: 't0k3n',
    type: 'Basic',
    expire: Date.now() + 3600000,
  }
  const expected = {
    Authorization: 'Basic t0k3n',
  }

  const ret = authenticator.asHttpHeaders(authentication)

  t.deepEqual(ret, expected)
})

test('asHttpHeaders should return token as Authorization header with no token type', (t) => {
  const authentication = {
    status: 'granted',
    token: 't0k3n',
    type: null,
    expire: Date.now() + 3600000,
  }
  const expected = {
    Authorization: 't0k3n',
  }

  const ret = authenticator.asHttpHeaders(authentication)

  t.deepEqual(ret, expected)
})

test('asHttpHeaders should return empty object when not authenticated', (t) => {
  const authentication = {
    status: 'granted',
    token: 't0k3n',
    expire: Date.now() - 3600000,
  }
  const expected = {}

  const ret = authenticator.asHttpHeaders(authentication)

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
  const { asHttpHeaders } = authenticator

  const ret = asHttpHeaders(authentication)

  t.deepEqual(ret, expected)
})
