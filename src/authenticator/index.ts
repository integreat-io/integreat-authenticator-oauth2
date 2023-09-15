import authenticate from './authenticate.js'

export type AuthOptions = Record<string, unknown>

export interface Authentication extends AuthOptions {
  status: string
  token?: string
  expire?: number
  error?: string
}

export interface Authenticator {
  authenticate: (options: AuthOptions | null) => Promise<Authentication>
  isAuthenticated: (authentication: Authentication | null) => boolean
  authentication: {
    [asFunction: string]: (
      authentication: Authentication | null
    ) => Record<string, unknown>
  }
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

export interface JwtAssertionOptions {
  grantType: 'jwtAssertion'
  uri: string
  key: string
  secret: string
  scope?: string
  audience?: string
  algorithm?: 'HS256' | 'RS256'
  expiresIn?: number
}

export type Options = RefreshOptions | ClientOptions | JwtAssertionOptions

export interface TokenObject extends Record<string, unknown> {
  token?: string
}

export interface HttpHeaders extends Record<string, unknown> {
  Authorization?: string
}

function isAuthenticated(
  authentication: Authentication | null
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
