import jwt from 'jsonwebtoken'
import type { JwtAssertionOptions } from './types.js'

export default function signJwt(options: JwtAssertionOptions): string | null {
  const {
    key,
    secret,
    audience,
    algorithm = 'HS256',
    expiresIn,
    scope,
  } = options

  const payload = {
    iss: key,
    scope,
  }

  const signOptions = { algorithm, audience, ...(expiresIn && { expiresIn }) }

  try {
    const token = jwt.sign(payload, secret, signOptions)
    return token
  } catch (err) {
    return null
  }
}
