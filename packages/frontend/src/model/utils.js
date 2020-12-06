export function cryptoRandomString(len = 16) {
    const arr = window.crypto.getRandomValues(new Uint8Array(len))
    const state = []
    for (const b of arr) {
        state.push(b.toString(16))
    }
    return state.join('')
}

export function encodeQuery(query) {
    const res = []
    for (const k in query) {
        res.push(`${encodeURIComponent(k)}=${encodeURIComponent(query[k])}`)
    }
    return res.join('&')
}

export function encodeUrlQuery(url, query) {
    const u = encodeURI(url)
    const q = encodeQuery(query)
    if (q.length) {
        return `${u}?${q}`
    }
    return u
}

export function parseQueryString(str) {
    const obj = {}

    str = str || ''
    str.split('&').forEach((param) => {
        const keyVal = param.split('=')
        const key = decodeURIComponent(keyVal[0])
        obj[key] = keyVal[1] ? decodeURIComponent(keyVal[1]) : true
    })

    return obj
}

/**
 * Get full path based on current location
 *
 * @author Sahat Yalkabov <https://github.com/sahat>
 * @copyright Method taken from https://github.com/sahat/satellizer
 *
 * @param  {Location} location
 * @return {String}
 */
export function getFullUrlPath(location) {
    const isHttps = location.protocol === 'https:'
    return (
        location.protocol +
        '//' +
        location.hostname +
        ':' +
        (location.port || (isHttps ? '443' : '80')) +
        (/^\//.test(location.pathname)
            ? location.pathname
            : '/' + location.pathname)
    )
}
