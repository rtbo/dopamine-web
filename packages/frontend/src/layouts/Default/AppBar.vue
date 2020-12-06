<template>
    <v-app-bar app dark color="primary">
        <v-app-bar-nav-icon @click="drawer = !drawer" />

        <v-toolbar-title>Application</v-toolbar-title>

        <v-spacer></v-spacer>

        <v-btn v-if="!signedIn" to="/signin" light>Sign-In</v-btn>
        <span v-else>
            <v-avatar>
                <img v-if="avatarUrl" :src="avatarUrl" alt="avatar" />
                <span v-else>{{ initials }}</span>
            </v-avatar>
            &nbsp;
            {{ name }}
        </span>
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
}
</script>
