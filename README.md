# OAuth 2.0 authenticator for Integreat

Makes Integreat handle authentication with an OAuth 2.0 service. Supports three
grant types: client credentials, refresh token, and assertion with self-signed
JWT token.

[![npm Version](https://img.shields.io/npm/v/integreat-authenticator-oauth2.svg)](https://www.npmjs.com/package/integreat-authenticator-oauth2)
[![Maintainability](https://api.codeclimate.com/v1/badges/6331723a6ff61de5f232/maintainability)](https://codeclimate.com/github/integreat-io/integreat-authenticator-oauth2/maintainability)

## Getting started

### Prerequisits

Requires node v18 and Integreat v1.0.

### Installing and using

Install from npm:

```
npm install integreat-authenticator-oauth2
```

Example setup with refresh token grant type:

```javascript
import Integreat from 'integreat'
import oauth2 from 'integreat-authenticator-oauth2'

const defs = {
  auths: {
    id: 'service-oauth2',
    authenticator: 'oauth2',
    options: {
      grantType: 'refreshToken',
      uri: 'https://api.service.test/oauth/v1/token',
      key: 'client1',
      secret: 's3cr3t,
      redirectUri: 'https://service.test/cb,
      refreshToken: 't0k3n',
    }
  },
  schemas: [ /* your schemas */ ],
  services: [
    {
      id: 'service-with-oauth2',
      transporter: 'http',
      adapters: ['json'],
      auth: 'service-oauth2',
      endpoints: [ /* your endpoints */ ],
    },
  ],
}

const resources = {
  authenticators: {
    oauth2,
  },
  /* your other resources */,
}

const great = Integreat.create(defs, resources)
```

An auth def with the client credentials grant type could look like this:

```javascript
const def = {
  auths: {
    id: 'service-oauth2',
    authenticator: 'oauth2',
    options: {
      grantType: 'clientCredential',
      uri: 'https://api.service.test/oauth/v1/token',
      key: 'client1',
      secret: 's3cr3t',
    },
  },
}
```

An auth def with the client credentials grant type could look like this:

```javascript
const def = {
  auths: {
    id: 'service-oauth2',
    authenticator: 'oauth2',
    options: {
      grantType: 'jwtAssertion',
      uri: 'https://api.service.test/oauth/v1/token',
      key: 'client1',
      secret: privateKey, // In case of RS256, this needs to be the complete private key file
      scope: 'all',
      audience: 'https://api.service.test/oauth/v1/token',
      algorithm: 'RS256',
      expiresIn: 3600,
    },
  },
}
```

All grant types may include a `scope` options, which is a space delimited
string of scope keywords, defined by the targeted service.

### Running the tests

The tests can be run with `npm test`.

## Contributing

Please read
[CONTRIBUTING](https://github.com/integreat-io/integreat-authenticator-oauth2/blob/master/CONTRIBUTING.md)
for details on our code of conduct, and the process for submitting pull
requests.

## License

This project is licensed under the ISC License - see the
[LICENSE](https://github.com/integreat-io/integreat-authenticator-oauth2/blob/master/LICENSE)
file for details.
