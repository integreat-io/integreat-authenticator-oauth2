import type {
  Authentication as BaseAuthentication,
  AuthOptions as BaseAuthOptions,
} from 'integreat'

export interface Authentication extends BaseAuthentication {
  token?: string
  refreshToken?: string
  type?: string
}

export interface BaseOptions {
  uri: string
  key: string
  secret: string
}

export interface AuthCodeOptions extends BaseOptions {
  grantType: 'authorizationCode'
  redirectUri: string
  code: string
  scope?: string
}

export interface RefreshOptions extends BaseOptions {
  grantType: 'refreshToken'
  redirectUri: string
  refreshToken: string
  scope?: string
}

export interface ClientOptions extends BaseOptions {
  grantType: 'clientCredentials'
  scope?: string
}

export interface JwtAssertionOptions extends BaseOptions {
  grantType: 'jwtAssertion'
  scope?: string
  audience?: string
  algorithm?: 'HS256' | 'RS256'
  expiresIn?: number
}

export type Options = BaseAuthOptions & {
  authHeaderType?: string
  headers?: Record<string, string | string[]>
} & (AuthCodeOptions | RefreshOptions | ClientOptions | JwtAssertionOptions)

export type AuthOptions = Partial<Options>

export interface TokenObject extends Record<string, unknown> {
  token?: string
}

export interface HttpHeaders extends Record<string, unknown> {
  Authorization?: string
}
