<template>
  <v-app>
    <default-app-bar />
    <v-main>
      <v-fade-transition mode="out-in">
        <router-view />
      </v-fade-transition>
    </v-main>
  </v-app>
</template>

<script>
export default {
  name: 'DefaultLayout',

  components: {
    DefaultAppBar: () => import('./components/AppBar'),
  },
}
</script>
