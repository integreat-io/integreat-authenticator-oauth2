import test from 'ava'
import nock = require('nock')

import resources from '..'
const { oauth2 } = resources.authenticators

test('should authenticate', async (t) => {
  const expectedRequest = 'grant_type=refreshToken&client_id=client1&client_secret=s3cr3t&' +
    'redirect_uri=https%3A%2F%2Fredirect.com%2Fhere&refresh_token=r3fr3sh'
  const scope = nock('https://api1.test', {
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
  const options = {
    apiUri: 'https://api1.test/token',
    clientId: 'client1',
    clientSecret: 's3cr3t',
    redirectUri: 'https://redirect.com/here',
    refreshToken: 'r3fr3sh'
  }
  const authentication = null

  const isAuth1 = oauth2.isAuthenticated(authentication)
  const ret = await oauth2.authenticate(options)
  const isAuth2 = oauth2.isAuthenticated(ret)

  t.false(isAuth1)
  t.is(ret.status, 'granted')
  t.is(ret.token, 't0k3n')
  t.true(isAuth2)
  t.true(scope.isDone())

  nock.restore()
})
