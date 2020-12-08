import axios from 'axios'

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

export function authHeader() {
  const userToken = store.get('user/token')
  return {
    Authorization: `Bearer ${userToken}`,
  }
}

export default axios.create({
  baseURL: resource(),
})
