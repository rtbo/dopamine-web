import Joi from 'joi'
import { ObjectId } from 'mongodb'
import { signJwt } from '../crypto'
import env from '../env'
import validateRequest from '../validate-request'
import { requireAuth } from './auth'

function createCLIAuthJwt(id) {
    return signJwt({}, env.jwtSecret, { subject: id.toString() })
}

function keyExtract(key) {
    if (key.length < 15) throw new Error('unexpected short CLI key')
    const len = key.length
    return key.slice(0, 3) + ' ... ' + key.slice(len - 12)
}

export async function setupUsers(router) {
    router.get(
        '/users/:id',
        validateRequest({
            params: {
                id: Joi.string().required(),
            },
        }),
        async (ctx) => {
            const { id } = ctx.params

            const doc = await ctx.db.collection('users').findOne(ObjectId(id))

            ctx.assert(doc, 404)

            ctx.body = {
                id,
                name: doc.name,
                avatarUrl: doc.avatarUrl,
            }
        }
    )

    router.get(
        '/users/:id/cli-keys',
        requireAuth,
        validateRequest({
            params: {
                id: Joi.string().required(),
            },
        }),
        async (ctx) => {
            const { id } = ctx.request.params

            ctx.assert(
                ctx.state.auth === id,
                403,
                'id parameter do not match with authorized user'
            )

            const user = await ctx.db
                .collection('users')
                .findOne(ObjectId(id), {
                    projection: {
                        cliKeys: 1,
                    },
                })

            ctx.assert(user, 404)

            if (!user.cliKeys) {
                ctx.body = { cliKeys: [] }
            } else {
                const cliKeys = user.cliKeys.map(({ name, key }) => ({
                    name,
                    key: keyExtract(key),
                }))
                ctx.body = { cliKeys }
            }
        }
    )

    router.del(
        '/users/:id/cli-keys/:name',
        requireAuth,
        validateRequest({
            params: {
                id: Joi.string().required(),
                name: Joi.string().required(),
            },
        }),
        async (ctx) => {
            const { id, name } = ctx.request.params

            ctx.assert(
                ctx.state.auth === id,
                403,
                'id parameter do not match with authorized user'
            )

            const doc = await ctx.db.collection('users').findOneAndUpdate(
                {
                    _id: ObjectId(id),
                },
                {
                    $pull: {
                        cliKeys: { name },
                    },
                },
                {
                    returnOriginal: false,
                    projection: {
                        cliKeys: 1,
                    },
                }
            )

            console.log(doc.value)
            ctx.assert(doc.value, 404)

            const user = doc.value
            if (!user.cliKeys) {
                ctx.body = { cliKeys: [] }
            } else {
                const cliKeys = user.cliKeys.map(({ name, key }) => ({
                    name,
                    key: keyExtract(key),
                }))
                ctx.body = { cliKeys }
            }
        }
    )

    router.post(
        '/users/:id/cli-keys',
        requireAuth,
        validateRequest({
            params: {
                id: Joi.string().required(),
            },
            body: {
                name: Joi.string().required(),
            },
        }),
        async (ctx) => {
            const { id } = ctx.request.params
            const { name } = ctx.request.body

            ctx.assert(
                ctx.state.auth === id,
                403,
                'id parameter do not match with authorized user'
            )

            const ck = await ctx.db.collection('users').findOne({
                _id: ObjectId(id),
                'cliKeys.name': name,
            })

            ctx.assert(ck === null, 400, `'${name}' already exists`)

            const key = await createCLIAuthJwt(id)
            const doc = await ctx.db.collection('users').findOneAndUpdate(
                {
                    _id: ObjectId(id),
                },
                {
                    $push: {
                        cliKeys: {
                            name,
                            key,
                        },
                    },
                },
                {
                    returnOriginal: false,
                    projection: {
                        cliKeys: 1,
                    },
                }
            )

            ctx.assert(doc.value, 500)

            const { cliKeys } = doc.value
            ctx.body = cliKeys[cliKeys.length - 1]
        }
    )
}
