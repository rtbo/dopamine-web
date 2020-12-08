<template>
    <v-app>
        <default-app-bar />
        <v-main>
            <v-container>
                <v-row align-content="start" justify="center" class="my-4">
                    <v-col cols="12" sm="4" lg="3">
                        <v-navigation-drawer
                            floating
                            permanent
                            class="d-inline-block"
                        >
                            <v-list dense>
                                <v-list-item
                                    v-for="item in navItems"
                                    :key="item.to"
                                    link
                                    :to="item.to"
                                >
                                    <v-list-item-icon>
                                        <v-icon>{{ item.icon }}</v-icon>
                                    </v-list-item-icon>
                                    <v-list-item-content>
                                        <v-list-item-title>{{
                                            item.title
                                        }}</v-list-item-title>
                                    </v-list-item-content>
                                </v-list-item>
                            </v-list>
                        </v-navigation-drawer>
                    </v-col>
                    <v-col cols="12" sm="8" lg="5">
                        <v-fade-transition mode="out-in">
                            <router-view />
                        </v-fade-transition>
                        <v-card> </v-card>
                    </v-col>
                </v-row>
            </v-container>
        </v-main>
    </v-app>
</template>

<script>
export default {
    name: 'SettingsLayout',
    components: {
        DefaultAppBar: () => import('./components/AppBar'),
    },
    data() {
        return {
            navItems: [
                {
                    title: 'Profile',
                    icon: 'mdi-account',
                    to: '/settings/profile',
                },
                {
                    title: 'CLI Login',
                    icon: 'mdi-console',
                    to: '/settings/login',
                },
            ],
        }
    },
}
</script>

<style></style>
