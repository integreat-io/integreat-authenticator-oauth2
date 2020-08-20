# OAuth 2.0 authenticator for Integreat

Makes Integreat handle authentication with an OAuth 2.0 service. Supports two
grant types: client credentials and refresh token.

[![npm Version](https://img.shields.io/npm/v/integreat-authenticator-oauth2.svg)](https://www.npmjs.com/package/integreat-authenticator-oauth2)
[![Build Status](https://travis-ci.org/integreat-io/integreat-authenticator-oauth2.svg?branch=master)](https://travis-ci.org/integreat-io/integreat-authenticator-oauth2)
[![Coverage Status](https://coveralls.io/repos/github/integreat-io/integreat-authenticator-oauth2/badge.svg?branch=master)](https://coveralls.io/github/integreat-io/integreat-authenticator-oauth2?branch=master)
[![Maintainability](https://api.codeclimate.com/v1/badges/6331723a6ff61de5f232/maintainability)](https://codeclimate.com/github/integreat-io/integreat-authenticator-oauth2/maintainability)

## Getting started

### Prerequisits

Requires node v10 and Integreat v0.7.

### Installing and using

Install from npm:

```
npm install integreat-authenticator-oauth2
```

Example setup with refresh token grant type:

```javascript
import integreat from 'integreat'
import oauth2 from 'integreat-authenticator-oauth2')

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
      adapter: 'json',
      auth: 'service-oauth2',
      endpoints: [ /* your endpoints */ ],
      mappings: { /* your mapping */ },
    },
  ],
}

const resources = integreat.mergeResources(
  integreat.resources,
  oauth2,
  { /* your other resources */ },
})

const great = integreat(defs, resources)
```

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
