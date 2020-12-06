import axios from 'axios'
import { signJwt } from '../crypto'
import env from '../env'

const providersConfig = {
    github: {
        tokenUrl: 'https://github.com/login/oauth/access_token',
        userUrl: 'https://api.github.com/user',
        clientId: env.githubClientId,
        clientSecret: env.githubClientSecret,
    },
}

export async function login(ctx) {
    ctx.checkBody('provider').eq('github')
    ctx.checkBody('code').notEmpty()
    ctx.checkBody('state').notEmpty()

    const { provider, code, state } = ctx.request.body

    const config = providersConfig[provider]

    const token = await axios.post(
        config.tokenUrl,
        {
            client_id: config.clientId,
            client_secret: config.clientSecret,
            code,
            state,
        },
        {
            headers: {
                Accept: 'application/json',
            },
        }
    )

    const { token_type: tokenType, access_token: accessToken } = token.data

    ctx.assert(tokenType === 'bearer', 400, 'Unsupported OAuth 2 token_type')

    ctx.assert(
        accessToken !== 'undefined',
        400,
        'Did not receive access token from ' + provider
    )

    const user = await axios.get(config.userUrl, {
        headers: {
            Authorization: `token ${accessToken}`,
        },
    })

    const { email, name, avatar_url: avatarUrl } = user.data

    const doc = await ctx.db.collection('users').findOneAndUpdate(
        {
            email,
        },
        {
            $set: {
                email,
                name,
                avatarUrl,
            },
        },
        { upsert: true, returnOriginal: false }
    )

    const jwt = await loginJwt(doc.value)

    ctx.body = {
        token: jwt,
        user: {
            name: doc.value.name,
            avatarUrl: doc.value.avatarUrl,
        },
    }
}

export function loginJwt(user) {
    return signJwt({}, env.jwtSecret, {
        issuer: env.httpHost,
        subject: user._id.toString(),
        expiresIn: '12h',
    })
}

export function setupAuth(router) {
    router.post('/login', login)
}
