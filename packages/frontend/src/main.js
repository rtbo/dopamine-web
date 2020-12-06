/* eslint-disable import/order */
import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store, { provideVuexPathify } from './store'
import vuetify from './plugins/vuetify'
import './plugins'
import { provideOAuth } from './model/oauth'
import { resource } from './model/api'

Vue.config.productionTip = false

const oauthConfig = {
    apiUrl: resource('/login'),
    providers: {
        github: {
            clientId: process.env.GITHUB_CLIENTID || '3f2f6c2ce1e0bdf8ae6c',
        },
    },
}

new Vue({
    router,
    store,
    vuetify,
    setup(_, context) {
        provideOAuth(oauthConfig)
        provideVuexPathify(context)

        const { $store } = context.root
        $store.dispatch('user/CHECK_LOGIN')
    },
    render: (h) => h(App),
}).$mount('#app')
