import Joi from 'joi'
import { ObjectId } from 'mongodb'
import validate from '../validate'

const getUserSpec = {
    params: {
        id: Joi.string().required(),
    },
}

async function getUser(ctx) {
    const { id } = ctx.params

    const doc = await ctx.db.collection('users').findOne(ObjectId(id))

    ctx.assert(doc, 404)

    ctx.body = {
        id,
        name: doc.name,
        avatarUrl: doc.avatarUrl,
    }
}

export async function setupUsers(router) {
    router.get('/users/:id', validate(getUserSpec), getUser)
}
