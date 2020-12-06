/**
 * Vuetify Vue CLI Preset
 *
 * store/index.js
 *
 * vuex documentation: https://vuex.vuejs.org/
 */

// Vue
import { computed, inject, provide } from '@vue/composition-api'
import Vue from 'vue'
import Vuex from 'vuex'

// Utilities
// https://davestewart.github.io/vuex-pathify/#/
import pathify from '@/plugins/vuex-pathify'

// Modules
// https://vuex.vuejs.org/guide/modules.html
import * as modules from './modules'

Vue.use(Vuex)

export default new Vuex.Store({
    modules,
    plugins: [pathify.plugin],
})

// A reusable const for making root commits and dispatches
// https://vuex.vuejs.org/guide/modules.html#accessing-global-assets-in-namespaced-modules
export const ROOT_DISPATCH = Object.freeze({ root: true })

// utility for the composition API

const VuexPathifySymbol = Symbol('VuexPathify')

export function provideVuexPathify(context) {
    const { $store } = context.root
    const get = (path) => computed(() => $store.get(path))
    const set = (path, data) => $store.set(path, data)
    const sync = (path) =>
        computed({
            get: () => $store.get(path),
            set: (val) => $store.set(path, val),
        })
    const dispatch = (action, data) => $store.dispatch(action, data)
    const commit = (mutation, data) => $store.dispatch(mutation, data)

    provide(VuexPathifySymbol, { get, set, sync, dispatch, commit })
}

export function useVuexPathify() {
    return inject(VuexPathifySymbol)
}
