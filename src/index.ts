import authenticate from './authenticate.js'
import type {
  Authentication,
  Authenticator,
  TokenObject,
  HttpHeaders,
} from './types.js'

function isAuthenticated(
  authentication: Authentication | null,
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

const oauth2: Authenticator = {
  authenticate,

  isAuthenticated,

  authentication: {
    asObject(authentication: Authentication | null): TokenObject {
      return isAuthenticated(authentication)
        ? { token: authentication.token }
        : {}
    },

    asHttpHeaders(authentication: Authentication | null): HttpHeaders {
      return isAuthenticated(authentication)
        ? { Authorization: `Bearer ${authentication.token}` }
        : {}
    },
  },
}

export default oauth2
