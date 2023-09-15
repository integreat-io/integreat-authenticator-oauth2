import test from 'ava'
import nock from 'nock'

import authenticator from '../index.js'

test('should authenticate', async (t) => {
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

  const isAuth1 = authenticator.isAuthenticated(authentication)
  const ret = await authenticator.authenticate(options)
  const isAuth2 = authenticator.isAuthenticated(ret)

  t.false(isAuth1)
  t.is(ret.status, 'granted')
  t.is(ret.token, 't0k3n')
  t.true(isAuth2)
  t.true(scope.isDone())

  nock.restore()
})
