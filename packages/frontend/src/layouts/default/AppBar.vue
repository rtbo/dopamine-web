<template>
    <v-app-bar app>
        <v-app-bar-nav-icon @click="drawer = !drawer" />

        <v-toolbar-title>Application</v-toolbar-title>

        <v-spacer></v-spacer>

        <v-btn v-if="!signedIn" to="/signin">Sign-In</v-btn>
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
    },
}
</script>
