import { Options, Authentication } from '.'
import form from 'integreat-adapter-form'

interface Data {
  access_token: string,
  expires_in: number
}

interface Response {
  status: string,
  error?: string,
  data?: Data
}

const { adapter: formAdapter } = form

const validOptions = (options: Options) =>
  !!(options.clientId && options.clientSecret && options.redirectUri && options.refreshToken && options.apiUri)

const parseData = (data: string) => {
  try {
    return JSON.parse(data)
  } catch (error) {
    return null
  }
}

const createResponseFromData = (status: string, data: Data) =>
  (status === 'ok')
    ? {
      status: 'granted',
      token: data.access_token,
      expire: Date.now() + data.expires_in * 1000
    }
    : { status: 'refused' }

const createResponseFromError = (status: string, error?: string) =>
  ({
    status: 'error',
    error: (status === 'ok') ? 'Invalid json response' : error
  })

const createResponse = ({ status, error }: Response, data: Data) =>
  (data)
    ? createResponseFromData(status, data)
    : createResponseFromError(status, error)

export default async function authenticate (options: Options): Promise<Authentication> {
  if (!validOptions(options)) {
    return { status: 'error', error: 'Missing props on options object' }
  }

  const request = {
    method: 'QUERY',
    data: {
      grant_type: 'refreshToken',
      client_id: options.clientId,
      client_secret: options.clientSecret,
      redirect_uri: options.redirectUri,
      refresh_token: options.refreshToken
    },
    endpoint: { uri: options.apiUri as string }
  }

  const response = await formAdapter.send(await formAdapter.serialize(request))

  const data = parseData(response.data)
  return createResponse(response, data)
}
