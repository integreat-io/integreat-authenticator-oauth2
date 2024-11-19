import type {
  Authentication as BaseAuthentication,
  AuthOptions as BaseAuthOptions,
} from 'integreat'

export interface Authentication extends BaseAuthentication {
  token?: string
  refreshToken?: string
  type?: string
}

export interface AuthCodeOptions {
  grantType: 'authorizationCode'
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

export type Options = BaseAuthOptions & { authHeaderType?: string } & (
    | AuthCodeOptions
    | RefreshOptions
    | ClientOptions
    | JwtAssertionOptions
  )

export type AuthOptions = Partial<Options>

export interface TokenObject extends Record<string, unknown> {
  token?: string
}

export interface HttpHeaders extends Record<string, unknown> {
  Authorization?: string
}
