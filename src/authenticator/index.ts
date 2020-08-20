import authenticate from './authenticate'

export interface Authentication {
  status: string
  token?: string
  expire?: number
  error?: string
}

export interface RefreshOptions {
  grantType: 'refreshToken'
  uri: string
  key: string
  secret: string
  redirectUri: string
  refreshToken: string
  scope?: string
}

export interface ClientOptions {
  grantType: 'clientCredentials'
  uri: string
  key: string
  secret: string
  scope?: string
}

export type Options = RefreshOptions | ClientOptions

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
