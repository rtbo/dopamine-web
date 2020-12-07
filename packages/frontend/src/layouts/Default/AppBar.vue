<template>
    <v-app-bar app dark color="primary">
        <v-app-bar-nav-icon @click="drawer = !drawer" />

        <v-toolbar-title>Application</v-toolbar-title>

        <v-spacer></v-spacer>

        <v-btn v-if="!signedIn" to="/signin" light>Sign-In</v-btn>
        <v-menu v-else bottom offset-y>
            <template v-slot:activator="{ on }">
                <v-btn icon x-large v-on="on" class="mx-1">
                    <v-avatar>
                        <img v-if="avatarUrl" :src="avatarUrl" alt="avatar" />
                        <span v-else class="headline">{{ initials }}</span>
                    </v-avatar>
                </v-btn>
            </template>
            <v-list>
                <v-list-item>
                    <v-btn @click="logout">
                        <v-icon>mdi-logout</v-icon>
                        Logout
                    </v-btn>
                </v-list-item>
            </v-list>
        </v-menu>
    </v-app-bar>
</template>

<script>
// Utilities
import { get, sync } from 'vuex-pathify'

export default {
    name: 'DefaultAppBar',
    computed: {
        drawer: sync('app/drawer'),
        signedIn: get('user/signedIn'),
        name: get('user/name'),
        avatarUrl: get('user/avatarUrl'),
        initials: function () {
            if (!this.name) return ''
            return this.name
                .split(' ')
                .filter((word) => word.length !== 0)
                .map((word) => word[0].toUpperCase())
        },
    },
    methods: {
        logout: function () {
            this.$store.commit('user/LOGOUT')
        },
    },
}
</script>
