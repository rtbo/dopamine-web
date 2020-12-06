/**
 * plugins/vuetify.js
 *
 * Vuetify documentation: https://vuetifyjs.com/
 */

// Imports
import Vue from 'vue'
import Vuetify from 'vuetify/lib'

Vue.use(Vuetify)

export default new Vuetify({
    // https://vuetifyjs.com/en/features/theme/#theme-generator
    theme: {
        themes: {
            light: {
                primary: '#3F51B5',
                secondary: '#FFC107',
                error: '#B00020',
            },
        },
    },
})
