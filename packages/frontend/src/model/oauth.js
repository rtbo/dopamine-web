import { inject, provide, ref } from '@vue/composition-api'
import axios from 'axios'
import {
    cryptoRandomString,
    parseQueryString,
    encodeUrlQuery,
    getFullUrlPath,
} from './utils'

const OAuthSymbol = Symbol('OAuth')

const defaultPopupOptions = {
    menubar: 'no',
    location: 'no',
    resizable: 'no',
    scrollbar: 'no',
    status: 'no',
    width: 1020,
    height: 618,
}

const providersConfig = {
    github: {
        requestUrl: 'https://github.com/login/oauth/authorize',
    },
}

/**
 * call with { providers: { github: { clientId: 'xxx' }}}
 *
 */
export function provideOAuth(config) {
    if (!config.providers) {
        throw new Error('Providers expected')
    }

    for (const p in config.providers) {
        const oauthConfig = providersConfig[p]
        if (oauthConfig === undefined) {
            throw new Error('Unknown provider: ' + p)
        }

        const providerConfig = {
            ...config.providers[p],
            ...oauthConfig,
            name: p,
        }

        if (typeof providerConfig.clientId !== 'string') {
            throw new Error('clientId is mandatory for ' + p)
        }

        if (!providerConfig.redirectUrl)
            providerConfig.redirectUrl = `${window.location.origin}/auth/${p}`

        providerConfig.popupOptions = {
            ...defaultPopupOptions,
            ...providerConfig.popupOptions,
        }

        config.providers[p] = providerConfig
    }

    provide(OAuthSymbol, config)
}

export function useOAuth() {
    const config = inject(OAuthSymbol)

    const status = ref('')
    const error = ref('')
    const loading = ref(false)
    const onSuccess = ref(null)

    async function authenticate(provider) {
        try {
            const providerConfig = config.providers[provider]

            if (providerConfig === undefined)
                throw new Error(`${provider} not known or not configured`)

            console.log(providerConfig)

            const state = cryptoRandomString(16)

            status.value = 'popup'
            loading.value = true

            const params = await popupRequestParams(providerConfig, state)

            if (params.state !== state) {
                throw new Error(
                    `OAuth ${providerConfig.name}: state doesn't match`,
                )
            }

            status.value = 'api-auth'

            const res = await apiAuth(config, providerConfig, params)

            status.value = ''
            loading.value = false

            if (typeof onSuccess.value === 'function') {
                onSuccess.value(res)
            }

            return res
        } catch (e) {
            status.value = 'error'
            loading.value = false
            error.value = e.msg
            console.error(e)
        }
    }

    return {
        authenticate,
        status,
        error,
        loading,
        onSuccess,
    }
}

function popupRequestParams(providerConfig, state) {
    const requestQuery = {
        client_id: providerConfig.clientId,
        state,
        redirect_uri: providerConfig.redirectUrl,
    }

    const popupOptions = stringifyOptions(providerConfig.popupOptions)
    console.log(popupOptions)

    const popup = window.open(
        encodeUrlQuery(providerConfig.requestUrl, requestQuery),
        'Authentication',
        popupOptions,
    )

    if (popup && popup.focus) popup.focus()
    return new Promise((resolve, reject) => {
        const redirectUrlParser = document.createElement('a')
        redirectUrlParser.href = providerConfig.redirectUrl
        const redirectUrlPath = getFullUrlPath(redirectUrlParser)

        const poolingInterval = setInterval(() => {
            if (!popup || popup.closed || popup.closed === undefined) {
                clearInterval(poolingInterval)
                reject(new Error('Auth popup window closed'))
            }

            try {
                const popupPath = getFullUrlPath(popup.location)

                if (popupPath === redirectUrlPath) {
                    if (popup.location.search) {
                        const params = parseQueryString(
                            popup.location.search.substring(1),
                        )
                        resolve(params)
                    } else {
                        reject(
                            new Error(
                                'No query param in the OAuth redirection',
                            ),
                        )
                    }
                    clearInterval(poolingInterval)
                    popup.close()
                }
            } catch (e) {}
        }, 400)
    })
}

function stringifyOptions(popupOptions) {
    const options = []
    for (var optionKey in popupOptions) {
        if (popupOptions[optionKey] !== undefined) {
            options.push(`${optionKey}=${popupOptions[optionKey]}`)
        }
    }
    return options.join(',')
}

async function apiAuth(config, providerConfig, params) {
    const { code, state } = params

    if (!code || !state) {
        throw new Error('Popup request did not return code or state')
    }

    const res = await axios.post(config.apiUrl, {
        provider: providerConfig.name,
        code,
        state,
    })

    console.log(res)
    return res
}
