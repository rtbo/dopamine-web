import store from '../store'

export const host = process.env.VUE_APP_API_HOST || 'http://localhost'
export const port = process.env.VUE_APP_API_PORT || '3000'

const prefix = '/api'

/**
 * Compute the url of an API resource pointed by path
 *
 * @param {string} path
 */
export function resource(path) {
  const p = port === '80' ? '' : `:${port}`
  return `${host}${p}${prefix}${path || ''}`
}

const baseURL = resource()

export function authHeader() {
  const userToken = store.get('user/token')
  return {
    Authorization: `Bearer ${userToken}`,
  }
}

function axiosOptions(options) {
  if (options) {
    return {
      ...options,
      headers: {
        ...options.headers,
        ...authHeader(),
      },
    }
  } else {
    return {
      headers: {
        ...authHeader(),
      },
    }
  }
}

function GET(path, options) {
  return {
    url: path,
    method: 'GET',
    baseURL,
    ...axiosOptions(options),
  }
}

function POST(path, data, options) {
  return {
    url: path,
    method: 'POST',
    baseURL,
    data,
    ...axiosOptions(options),
  }
}

function DELETE(path, options) {
  return {
    url: path,
    method: 'DELETE',
    baseURL,
    ...axiosOptions(options),
  }
}

/**
 * Set of AxiosRequestConfig builders, usable with useAxios, or directly with axios library
 */
export const v1 = {
  /**
   * GET a user by its id.
   *
   * @param {string} id of the user
   */
  getUser(id) {
    return GET(`/v1/users/${id}`)
  },

  /**
   * GET a user's CLI keys
   *
   * @param {string} id of the user
   */
  getCliKeys(id) {
    return GET(`/v1/users/${id}/cli-keys`)
  },

  /**
   * POST a new CLI key creation
   *
   * @param {string} id of the user
   * @param {string} name of the key
   */
  postCliKey(id, name) {
    return POST(`/v1/users/${id}/cli-keys`, {
      name,
    })
  },

  /**
   * DELETE a CLI key
   *
   * @param {string} id of the user
   * @param {string} name of the key
   */
  delCliKey(id, name) {
    return DELETE(`/v1/users/${id}/cli-keys/${name}`)
  },
}

// const V1Symbol = Symbol('V1 API')

// export function provideApi() {
//   provide(V1Symbol, makeAxios(client))
// }

// export function useApi() {
//   return inject(V1Symbol)
// }
