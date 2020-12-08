<template>
  <div>
    <v-card-title>CLI Login</v-card-title>
    <v-card-subtitle>Manage CLI credentials</v-card-subtitle>
    <v-card-text>
      <v-card>
        <v-card-title>Generate a new key</v-card-title>
        <v-card-text>
          <v-container fluid>
            <v-row align="center" justify="start">
              <v-col cols="12" sm="8">
                <v-text-field
                  label="Key name"
                  placeholder="e.g. laptop"
                  v-model="newKeyName"
                  class="d-inline-block"
                  style="width: 300px"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="4">
                <v-btn
                  color="secondary"
                  class="mx-5"
                  :disabled="!newKeyName"
                  @click="newKeyGen"
                >
                  Generate
                </v-btn>
              </v-col>
            </v-row>
            <v-divider v-if="newKey"></v-divider>
            <v-row v-if="newKey">
              <v-col cols="12">
                <v-card-title class="text-h6">
                  New key available: {{ newKey.name }}
                </v-card-title>
                <v-card-subtitle>
                  It will be shown only once. Paste the following command in
                  your terminal to save it.
                </v-card-subtitle>
                <v-card-text>
                  <v-sheet
                    color="grey lighten-2"
                    class="rounded-lg codesheet"
                    style=""
                  >
                    dop login {{ newKey.key }}
                  </v-sheet>
                  <v-btn class="my-3" flat @click="newKeyCopy">
                    <v-icon>mdi-clipboard-text</v-icon>
                    Copy
                  </v-btn>
                  <v-snackbar v-model="newKeySnack">Copied!</v-snackbar>
                </v-card-text>
              </v-col>
            </v-row>
            <v-row v-if="newKey">
              <v-col></v-col>
              <v-card></v-card>
            </v-row>
          </v-container>
        </v-card-text>
      </v-card>
      <v-card class="my-10">
        <v-card-title>Active keys</v-card-title>
        <v-card-text>No active keys</v-card-text>
      </v-card>
    </v-card-text>
  </div>
</template>

<script>
import { ref } from '@vue/composition-api'
import api, { authHeader } from '../model/api'
import { useVuexPathify } from '../store'

export default {
  setup(props, context) {
    const { get } = useVuexPathify()

    const userId = get('user/id')

    const newKeyName = ref('')
    const newKey = ref(null)
    const newKeySnack = ref(false)

    async function newKeyGen() {
      const res = await api.post(
        `/v1/users/${userId.value}/cli-keys`,
        {
          name: newKeyName.value,
        },
        {
          headers: authHeader(),
        },
      )
      newKey.value = res.data
    }

    async function newKeyCopy() {
      const textToCopy = `dop login ${newKey.value.key}`
      await navigator.clipboard.writeText(textToCopy)
      newKeySnack.value = true
      setTimeout(() => {
        newKeySnack.value = false
      }, 1500)
    }

    return {
      newKeyName,
      newKeyGen,
      newKey,
      newKeyCopy,
      newKeySnack,
    }
  },
}
</script>

<style scoped>
.codesheet {
  font-family: 'Fira Code', 'Hasklig', 'Monospace';
  padding: 1em;
}
</style>
