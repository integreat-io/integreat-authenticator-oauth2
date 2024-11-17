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
      authentication: Authentication | null,
    ) => Record<string, unknown>
  }
}

export interface AuthCodeOptions {
  grantType: 'authorization_code'
  uri: string
  key: string
  secret: string
  redirectUri: string
  code: string
  scope?: string
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

export type Options =
  | AuthCodeOptions
  | RefreshOptions
  | ClientOptions
  | JwtAssertionOptions

export interface TokenObject extends Record<string, unknown> {
  token?: string
}

export interface HttpHeaders extends Record<string, unknown> {
  Authorization?: string
}
