import authenticate from './authenticate.js'
import type { Authenticator, Action } from 'integreat'
import type {
  Authentication,
  Options,
  TokenObject,
  HttpHeaders,
} from './types.js'

function isAuthenticated(
  authentication: Authentication | null,
  _options: Options | null,
  _action: Action | null,
): authentication is Authentication {
  if (!authentication) {
    return false
  }
  const { status, token, expire } = authentication
  return (
    status === 'granted' &&
    !!token &&
    (typeof expire !== 'number' || Date.now() < expire)
  )
}

const oauth2: Authenticator<Authentication, Options> = {
  authenticate,

  isAuthenticated,

  authentication: {
    asObject(authentication: Authentication | null): TokenObject {
      return isAuthenticated(authentication, null, null)
        ? { token: authentication.token }
        : {}
    },

    asHttpHeaders(authentication: Authentication | null): HttpHeaders {
      return isAuthenticated(authentication, null, null)
        ? { Authorization: `Bearer ${authentication.token}` }
        : {}
    },
  },
}

export default oauth2
