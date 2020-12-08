<template>
  <v-container>
    <v-row align="center" justify="center" class="my-12">
      <v-col cols="12" sm="8" md="6" lg="4">
        <v-card>
          <v-toolbar dark color="primary">
            <v-toolbar-title>Sign In</v-toolbar-title>
          </v-toolbar>
          <v-card-text>
            <v-btn @click="authenticate('github')">
              <v-icon>mdi-github</v-icon>
              with Github
            </v-btn>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { useOAuth } from '@/model/oauth'

export default {
  name: 'SignInPage',
  setup(props, context) {
    const { $store, $router } = context.root
    const { authenticate, onSuccess } = useOAuth()

    onSuccess.value = (resp) => {
      const { token, user } = resp.data
      $store.commit('user/LOGIN', {
        token,
        user,
      })
      $router.push('/')
    }

    return { authenticate }
  },
}
</script>
