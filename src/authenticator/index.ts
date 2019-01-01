import authenticate from './authenticate'

export type Authentication = {
  status: string,
  token?: string,
  expire?: number,
  error?: string
}

export type Options = {
  apiUri?: string,
  clientId?: string,
  clientSecret?: string,
  redirectUri?: string,
  refreshToken?: string
}

export default {
  authenticate,

  isAuthenticated (authentication: Authentication | null) {
    if (!authentication) {
      return false
    }
    const { status, token, expire } = authentication
    return status === 'granted' && !!token && Date.now() < (expire || 0)
  },

  asObject (authentication: Authentication) {
    return (this.isAuthenticated(authentication))
      ? { token: authentication.token }
      : {}
  },

  asHttpHeaders (authentication: Authentication) {
    return (this.isAuthenticated(authentication))
      ? { Authorization: `Bearer ${authentication.token}` }
      : {}
  }
}
