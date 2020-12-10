<template>
  <div>
    <v-card-title>CLI Login</v-card-title>
    <v-card-subtitle>Manage CLI credentials</v-card-subtitle>
    <v-card>
      <v-card-title>Generate a new key</v-card-title>
      <v-card-text>
        <div class="d-flex align-center">
          <v-text-field
            label="Key name"
            placeholder="e.g. laptop"
            v-model="newKeyName"
            class="d-inline-block"
            style="width: 300px"
          ></v-text-field>
          <v-btn
            small
            color="secondary"
            class="mx-5"
            :disabled="!newKeyName"
            @click="newKeyGen"
          >
            Generate
          </v-btn>
        </div>
        <div v-if="newKey">
          <v-divider></v-divider>
          <v-card-title class="text-h6">
            New key available: {{ newKey.name }}
          </v-card-title>
          <v-card-subtitle>
            It will be shown only once. Paste the following command in your
            terminal to save it.
          </v-card-subtitle>
          <v-card-text>
            <v-sheet color="grey lighten-2" class="rounded-lg codesheet">
              dop login {{ newKey.key }}
            </v-sheet>
            <v-btn class="my-3" flat @click="newKeyCopy">
              <v-icon>mdi-clipboard-text</v-icon>
              Copy
            </v-btn>
            <v-snackbar v-model="newKeySnack">Copied!</v-snackbar>
          </v-card-text>
        </div>
      </v-card-text>
    </v-card>
    <v-card class="my-10">
      <v-card-title>Active keys</v-card-title>
      <v-card-text>
        <span v-if="!activeKeys.length">No active key</span>
        <v-container fluid>
          <v-row v-for="cliKey in activeKeys" :key="cliKey.name" align="center">
            <v-col cols="3">{{ cliKey.name }}</v-col>
            <v-col cols="6">
              <v-sheet color="grey lighten-2" class="rounded-lg codesheet">
                {{ cliKey.key }}
              </v-sheet>
            </v-col>
            <v-col cols="3">
              <v-btn
                small
                class="mx-3"
                color="red ligthen-3"
                @click="revokeKey(cliKey.name)"
              >
                <v-icon>mdi-delete</v-icon>
                Revoke
              </v-btn>
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
import { onMounted, ref, watch } from '@vue/composition-api'
import axios from 'axios'
import { v1 } from '../model/api'
import { useVuexPathify } from '../store'

export default {
  setup(props, context) {
    const { get } = useVuexPathify()

    const userId = get('user/id')

    const newKeyName = ref('')
    const newKey = ref(null)
    const newKeySnack = ref(false)

    const activeKeys = ref([])

    async function updateActiveKeys(userId) {
      const res = await axios(v1.getCliKeys(userId))
      console.log('received')
      console.log(res)
      activeKeys.value = res.data.cliKeys
    }

    async function newKeyGen() {
      const res = await axios(v1.postCliKey(userId.value, newKeyName.value))
      newKey.value = res.data
      newKeyName.value = ''
      return updateActiveKeys(userId.value)
    }

    async function newKeyCopy() {
      const textToCopy = `dop login ${newKey.value.key}`
      await navigator.clipboard.writeText(textToCopy)
      newKeySnack.value = true
      setTimeout(() => {
        newKeySnack.value = false
      }, 1500)
    }

    async function revokeKey(name) {
      const res = await axios(v1.delCliKey(userId.value, name))
      activeKeys.value = res.data.cliKeys
      if (newKey.value && newKey.value.name === name) newKey.value = ''
    }

    watch(userId, async (id) => {
      await updateActiveKeys(id)
    })
    onMounted(() => {
      if (userId.value) return updateActiveKeys(userId.value)
    })

    return {
      newKeyName,
      newKeyGen,
      newKey,
      newKeyCopy,
      newKeySnack,
      activeKeys,
      revokeKey,
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
