import axios from 'axios'
import Joi from 'joi'
import { ObjectId } from 'mongodb'
import { signJwt, verifyJwt } from '../crypto'
import env from '../env'
import validateRequest from '../validate-request'

const providersConfig = {
    github: {
        tokenUrl: 'https://github.com/login/oauth/access_token',
        userUrl: 'https://api.github.com/user',
        clientId: env.githubClientId,
        clientSecret: env.githubClientSecret,
    },
}

function createAuthJwt(user) {
    return signJwt({}, env.jwtSecret, {
        issuer: env.httpHost,
        subject: user._id.toString(),
        expiresIn: '12h',
    })
}

function extractBearerToken(ctx) {
    const header =
        ctx.request.get('x-access-token') || ctx.request.get('authorization')
    if (header) {
        return header.startsWith('Bearer ') ? header.slice(7) : header
    }
    return null
}

async function approveAuthorization(ctx, token) {
    try {
        const decoded = await verifyJwt(token, env.jwtSecret)
        // token key is correct
        // checking if it was revoked by user
        const revoked = await ctx.db.collection('users').findOne({
            _id: ObjectId(decoded.sub),
            revokedKeys: token,
        })
        ctx.assert(!revoked, 401)
        ctx.state.auth = decoded.sub
    } catch (err) {
        ctx.throw(401)
    }
}

export async function checkAuth(ctx, next) {
    const token = extractBearerToken(ctx)
    if (token) {
        await approveAuthorization(ctx, token)
    }
    return next()
}

export async function requireAuth(ctx, next) {
    const token = extractBearerToken(ctx)
    ctx.assert(token, 401)
    await approveAuthorization(ctx, token)
    return next()
}

export function setupAuth(router) {
    router.post(
        '/login',
        validateRequest({
            body: {
                provider: Joi.string().valid('github').required(),
                code: Joi.string().required(),
                state: Joi.string().required(),
            },
        }),
        async (ctx) => {
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

            const {
                token_type: tokenType,
                access_token: accessToken,
                error_description: error,
            } = token.data

            ctx.assert(error === undefined, 400, error)

            ctx.assert(
                tokenType === 'bearer',
                400,
                'Unsupported OAuth 2 token_type'
            )

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

            const jwt = await createAuthJwt(doc.value)

            ctx.body = {
                token: jwt,
                user: {
                    id: doc.value.id,
                    name: doc.value.name,
                    avatarUrl: doc.value.avatarUrl,
                },
            }
        }
    )
}
