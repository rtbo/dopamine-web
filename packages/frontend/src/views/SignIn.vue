<template>
    <v-container>
        <v-row>
            <v-col>
                <v-card>
                    <v-toolbar>
                        <v-toolbar-title>Sign In</v-toolbar-title>
                    </v-toolbar>
                    <v-card-text>
                        <v-btn @click="authenticate('github')"
                            >with Github</v-btn
                        >
                        <v-btn>with Google</v-btn>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
import { useOAuth } from '@/model/oauth'

export default {
    setup(props, context) {
        const { $store } = context.root
        const { authenticate, onSuccess } = useOAuth()

        onSuccess.value = (resp) => {
            console.log(resp)
            const { token, user } = resp.data
            $store.commit('user/LOGIN', {
                token,
                user,
            })
        }

        return { authenticate }
    },
}
</script>

<style></style>
