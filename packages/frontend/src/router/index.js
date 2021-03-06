/**
 * Vuetify Vue CLI Preset
 *
 * router/index.js
 *
 * vue-router documentation: https://router.vuejs.org/
 */

// Imports
import Vue from 'vue'
import Router from 'vue-router'

import store from '../store'

Vue.use(Router)

function requireAuth(to, from, next) {
  if (store.get('user/signedIn')) {
    next()
  } else {
    const redirectQuery = to.path !== '/' ? `?redirect=${to.path}` : ''
    next({ path: `/signin${redirectQuery}` })
  }
}

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  scrollBehavior: (to, _, savedPosition) => {
    if (to.hash) return { selector: to.hash }
    if (savedPosition) return savedPosition

    return { x: 0, y: 0 }
  },
  routes: [
    {
      path: '/',
      // Layouts allow you to define different
      // structures for different view
      // https://router.vuejs.org/guide/essentials/nested-routes.html#nested-routes
      component: () => import('@/layouts/Default'),
      children: [
        // {
        //   path: '',
        //   name: 'Home',
        //   component: () => import('@/views/Home')
        // },
      ],
    },
    {
      path: '/signin',
      component: () => import('@/layouts/Naked'),
      children: [
        {
          path: '',
          name: 'Sign-In',
          component: () => import('@/pages/SignInPage'),
        },
      ],
    },
    {
      path: '/settings',
      component: () => import('@/layouts/Settings'),
      beforeEnter: requireAuth,
      children: [
        {
          path: '',
          redirect: 'profile',
        },
        {
          path: 'profile',
          name: 'Profile',
          component: () => import('@/pages/SettingsProfile'),
        },
        {
          path: 'login',
          name: 'CLI Login',
          component: () => import('@/pages/SettingsLogin'),
        },
      ],
    },
  ],
})
