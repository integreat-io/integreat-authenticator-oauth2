import formTransformer from 'integreat-adapter-form/transformer.js'
import signJwt from './signJwt.js'
import type { Action, HandlerDispatch } from 'integreat'
import type { AuthOptions, Options, Authentication } from './types.js'

interface ResponseData {
  access_token: string
  refresh_token?: string
  expires_in: number
  error_description?: string
}

const VALID_GRANT_TYPES = [
  'authorizationCode',
  'refreshToken',
  'clientCredentials',
  'jwtAssertion',
]

// Create a simple serialization function from a transformer. We're jumping
// through some hoops here, but it makes this behave exactly as form content in
// other parts of Integreat.
const serializeForm = (data: unknown) =>
  formTransformer({})({})(data, { rev: true, context: [], value: data }) as
    | string
    | undefined

const base64Auth = (key: string, secret: string) =>
  Buffer.from(`${key}:${secret}`).toString('base64')

const isValidOptions = (
  options: Partial<AuthOptions> | null,
): options is Options =>
  !!options &&
  typeof options.grantType === 'string' &&
  VALID_GRANT_TYPES.includes(options.grantType)

const baseFields = ['grantType', 'uri', 'key', 'secret']
const conditionalFields = {
  authorizationCode: ['redirectUri', 'code'],
  refreshToken: ['redirectUri', 'refreshToken'],
}

function hasRequiredOptions(options: Options): string[] {
  const requiredFields = [
    ...baseFields,
    ...(conditionalFields[
      options.grantType as keyof typeof conditionalFields
    ] || []),
  ]
  return requiredFields.filter((field) => !options[field as keyof Options])
}

async function parseData(response: Response): Promise<ResponseData | null> {
  try {
    return (await response.json()) as ResponseData // TODO: We assume that the data response is correct here. We should probably not.
  } catch (error) {
    return null
  }
}

// Will return authorization code type as if it was a refresh token, when it has
// a refresh token in the `authentication`. Otherwise, return what is asked for.
function resolveTypeAndToken(
  options: Options,
  authentication: Authentication | null,
): ['authorization_code' | 'refresh_token', string] {
  if (
    options.grantType === 'authorizationCode' &&
    !authentication?.refreshToken
  ) {
    return ['authorization_code', options.code]
  } else {
    return [
      'refresh_token',
      options.grantType === 'refreshToken'
        ? options.refreshToken
        : (authentication?.refreshToken as string), // Use the auth refresh token for authorization code
    ]
  }
}

function prepareFormData(
  options: Options,
  authentication: Authentication | null,
) {
  switch (options.grantType) {
    case 'authorizationCode':
    case 'refreshToken':
      const [grantType, token] = resolveTypeAndToken(options, authentication)
      return {
        grant_type: grantType,
        client_id: options.key,
        client_secret: options.secret,
        redirect_uri: options.redirectUri,
        ...(grantType === 'refresh_token'
          ? { refresh_token: token }
          : { code: token }),
      }
    case 'jwtAssertion':
      return {
        grantType: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: signJwt(options),
      }
    default:
      return {
        grant_type: 'client_credentials',
      }
  }
}

const getHeaders = (options: Options): Record<string, string> =>
  options.grantType === 'clientCredentials'
    ? {
        Authorization: `Basic ${base64Auth(options.key, options.secret)}`,
      }
    : {}

export default async function authenticate(
  options: Partial<AuthOptions> | null,
  _action: Action | null,
  _dispatch: HandlerDispatch,
  authentication: Authentication | null,
): Promise<Authentication> {
  if (!isValidOptions(options)) {
    return {
      status: 'error',
      error: 'Unknown or missing grant type option',
    }
  }
  const missingFields = hasRequiredOptions(options)
  if (missingFields.length > 0) {
    return {
      status: 'error',
      error: `Missing ${missingFields.join(', ')} option${missingFields.length > 1 ? 's' : ''}`,
    }
  }

  const uri = options.uri
  const body = serializeForm({
    ...prepareFormData(options, authentication),
    ...(options.scope ? { scope: options.scope } : {}),
  })
  const headers = {
    'content-type': 'application/x-www-form-urlencoded;charset=UTF-8',
    ...getHeaders(options),
  }
  const request = {
    method: 'POST',
    body,
    headers,
  }

  let response: Response
  try {
    response = await fetch(uri, request)
  } catch (error) {
    return {
      status: 'error',
      error: error instanceof Error ? error.message : String(error),
    }
  }

  const data = await parseData(response)
  if (response.ok) {
    if (data) {
      return {
        status: 'granted',
        token: data.access_token,
        expire: Date.now() + data.expires_in * 1000,
        type: options.authHeaderType,
        ...(data.refresh_token ? { refreshToken: data.refresh_token } : {}),
      }
    } else {
      return { status: 'error', error: 'Invalid json response' }
    }
  } else {
    if (response.status === 400) {
      return {
        status: 'refused',
        error: data?.error_description
          ? `Refused by service: ${data?.error_description}`
          : 'Refused by service',
      }
    } else {
      return { status: 'error', error: response.statusText }
    }
  }
}
