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

function isAuthenticated (authentication: Authentication | null) {
  if (!authentication) {
    return false
  }
  const { status, token, expire } = authentication
  return status === 'granted' && !!token && Date.now() < (expire || 0)
}

export default {
  authenticate,

  isAuthenticated,

  asObject (authentication: Authentication) {
    return (isAuthenticated(authentication))
      ? { token: authentication.token }
      : {}
  },

  asHttpHeaders (authentication: Authentication) {
    return (isAuthenticated(authentication))
      ? { Authorization: `Bearer ${authentication.token}` }
      : {}
  }
}
