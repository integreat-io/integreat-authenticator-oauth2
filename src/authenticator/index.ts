import authenticate from './authenticate'

export interface Authentication {
  status: string
  token?: string
  expire?: number
  error?: string
}

export interface Options {
  apiUri?: string
  clientId?: string
  clientSecret?: string
  redirectUri?: string
  refreshToken?: string
}

export interface TokenObject {
  token?: string
}

export interface HttpHeaders {
  Authorization?: string
}

function isAuthenticated(authentication: Authentication | null): boolean {
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

export default {
  authenticate,

  isAuthenticated,

  asObject(authentication: Authentication): TokenObject {
    return isAuthenticated(authentication)
      ? { token: authentication.token }
      : {}
  },

  asHttpHeaders(authentication: Authentication): HttpHeaders {
    return isAuthenticated(authentication)
      ? { Authorization: `Bearer ${authentication.token}` }
      : {}
  },
}
