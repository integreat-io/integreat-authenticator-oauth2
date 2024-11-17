import formTransformer from 'integreat-adapter-form/transformer.js'
import signJwt from './signJwt.js'
import type { Options, Authentication } from './types.js'

interface ResponseData {
  access_token: string
  expires_in: number
}

const serializeForm = (data: unknown): string | undefined =>
  formTransformer({})()(data, { rev: true })

const base64Auth = (key: string, secret: string) =>
  Buffer.from(`${key}:${secret}`).toString('base64')

const isValidOptions = (options: Partial<Options> | null): options is Options =>
  !!(
    options &&
    options.uri &&
    options.key &&
    options.secret &&
    ((options.grantType === 'refreshToken' &&
      options.redirectUri &&
      options.refreshToken) ||
      options.grantType === 'clientCredentials' ||
      options.grantType === 'jwtAssertion')
  )

async function parseData(response: Response): Promise<ResponseData | null> {
  try {
    return (await response.json()) as ResponseData // TODO: We assume that the data response is correct here. We should probably not.
  } catch (error) {
    return null
  }
}

const getData = (options: Options) =>
  options.grantType === 'refreshToken'
    ? {
        grant_type: 'refresh_token',
        client_id: options.key,
        client_secret: options.secret,
        redirect_uri: options.redirectUri,
        refresh_token: options.refreshToken,
      }
    : options.grantType === 'jwtAssertion'
      ? {
          grantType: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
          assertion: signJwt(options),
        }
      : {
          grant_type: 'client_credentials',
        }

const getHeaders = (options: Options): Record<string, string> =>
  options.grantType === 'clientCredentials'
    ? {
        Authorization: `Basic ${base64Auth(options.key, options.secret)}`,
      }
    : {}

export default async function authenticate(
  options: Partial<Options> | null,
): Promise<Authentication> {
  if (!isValidOptions(options)) {
    return { status: 'error', error: 'Missing props on options object' }
  }

  const uri = options.uri
  const body = serializeForm({
    ...getData(options),
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

  if (response.ok) {
    const data = await parseData(response)
    if (data) {
      return {
        status: 'granted',
        token: data.access_token,
        expire: Date.now() + data.expires_in * 1000,
      }
    } else {
      return { status: 'error', error: 'Invalid json response' }
    }
  } else {
    if (response.status === 400) {
      return { status: 'refused' }
    } else {
      return { status: 'error', error: response.statusText }
    }
  }
}
