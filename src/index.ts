import authenticate from './authenticate.js'
import type { Authenticator, Action } from 'integreat'
import type {
  Authentication,
  AuthOptions,
  TokenObject,
  HttpHeaders,
} from './types.js'

function isAuthenticated(
  authentication: Authentication | null,
  _options: AuthOptions | null,
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

const oauth2: Authenticator<Authentication, AuthOptions> = {
  authenticate,

  isAuthenticated,

  authentication: {
    asObject(authentication: Authentication | null): TokenObject {
      return isAuthenticated(authentication, null, null)
        ? { token: authentication.token }
        : {}
    },

    asHttpHeaders(authentication: Authentication | null): HttpHeaders {
      const type =
        authentication?.type === undefined ? 'Bearer' : authentication.type
      return isAuthenticated(authentication, null, null)
        ? {
            Authorization: type
              ? `${type} ${authentication.token}`
              : authentication.token, // No auth type or empty string
          }
        : {}
    },
  },
}

export default oauth2
