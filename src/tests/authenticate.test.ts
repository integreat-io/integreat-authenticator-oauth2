import test from 'node:test'
import assert from 'node:assert/strict'
import nock from 'nock'
import type { Action } from 'integreat'

import authenticator from '../index.js'

// Setup

const dispatch = async (_action: Action) => ({ status: 'noaction' })

// Tests

test('should authenticate', async () => {
  const expectedRequest =
    'grant_type=refresh_token&client_id=client1&client_secret=s3cr3t&' +
    'redirect_uri=https%3A%2F%2Fredirect.com%2Fhere&refresh_token=r3fr3sh'
  const scope = nock('https://api1.test', {
    reqheaders: {
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
    },
  })
    .post('/token', expectedRequest)
    .reply(200, {
      refresh_token: 'r3fr3sh',
      access_token: 't0k3n',
      expires_in: 21600,
    })
  const options = {
    grantType: 'refreshToken' as const,
    uri: 'https://api1.test/token',
    key: 'client1',
    secret: 's3cr3t',
    redirectUri: 'https://redirect.com/here',
    refreshToken: 'r3fr3sh',
  }
  const authentication = null

  const isAuth1 = authenticator.isAuthenticated(authentication, options, null)
  const ret = await authenticator.authenticate(options, null, dispatch, null)
  const isAuth2 = authenticator.isAuthenticated(ret, options, null)

  assert.equal(isAuth1, false)
  assert.equal(ret.status, 'granted', ret.error)
  assert.equal(ret.token, 't0k3n')
  assert.equal(isAuth2, true)
  assert.equal(scope.isDone(), true)

  nock.restore()
})
