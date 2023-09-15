import form from 'integreat-adapter-form'
import signJwt from './signJwt.js'
import type { Options, Authentication } from './index.js'

interface Data {
  access_token: string
  expires_in: number
}

interface Response {
  status: string
  error?: string
}

const { form: formAdapter } = form.adapters

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
const parseData = (data: string) => {
  try {
    return JSON.parse(data)
  } catch (error) {
    return null
  }
}

const createResponseFromData = (status: string, data: Data) =>
  status === 'ok'
    ? {
        status: 'granted',
        token: data.access_token,
        expire: Date.now() + data.expires_in * 1000,
      }
    : { status: 'refused' }

const createResponseFromError = (status: string, error?: string) => ({
  status: 'error',
  error: status === 'ok' ? 'Invalid json response' : error,
})

const createResponse = ({ status, error }: Response, data: Data) =>
  data
    ? createResponseFromData(status, data)
    : createResponseFromError(status, error)

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
  options: Partial<Options> | null
): Promise<Authentication> {
  if (!isValidOptions(options)) {
    return { status: 'error', error: 'Missing props on options object' }
  }

  const request = {
    method: 'QUERY',
    data: {
      ...getData(options),
      ...(options.scope ? { scope: options.scope } : {}),
    },
    headers: getHeaders(options),
    endpoint: { uri: options.uri as string },
  }

  const response = await formAdapter.send(await formAdapter.serialize(request))

  const data = parseData(response.data as string)
  return createResponse(response, data)
}
