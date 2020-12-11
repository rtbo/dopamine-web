import axios from 'axios'
import jwtDecode from 'jwt-decode'
import { v1 } from '@/model/api'

const state = {
  token: localStorage.getItem('USER_TOKEN'),
  name: null,
  avatarUrl: null,
}

const getters = {
  id(state) {
    if (state.token) {
      const { sub } = jwtDecode(state.token)
      return sub
    } else {
      return null
    }
  },
  signedIn(state) {
    return !!state.token
  },
}

const mutations = {
  LOGIN: (state, { token, user }) => {
    console.log('LOGIN commit')
    state.token = token
    state.name = user.name
    state.avatarUrl = user.avatarUrl
    localStorage.setItem('USER_TOKEN', token)
  },
  LOGOUT: (state) => {
    console.log('LOGOUT commit')
    state.token = null
    state.name = null
    state.avatarUrl = null
    localStorage.removeItem('USER_TOKEN')
  },
}

const actions = {
  LOGIN: async ({ commit }, { token, user }) => {
    const { sub, exp } = jwtDecode(token)

    console.log('LOGIN dispatch')

    if (exp > Date.now()) {
      commit('LOGOUT')
      return
    }

    if (!user) {
      try {
        const { data } = await axios(v1.getUser(sub))
        user = data
      } catch (e) {
        commit('LOGOUT')
        console.error(e)
        return
      }
    }

    commit('LOGIN', { token, user })
  },
  CHECK_LOGIN: ({ dispatch, commit }) => {
    console.log('CHECK_LOGIN')
    const token = localStorage.getItem('USER_TOKEN')
    if (token) dispatch('LOGIN', { token })
    else commit('LOGOUT')
  },
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
}
