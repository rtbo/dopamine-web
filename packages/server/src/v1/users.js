import { ObjectId } from 'mongodb'

async function getUser(ctx) {
    ctx.checkParams('id')
    const { id } = ctx.params

    const doc = await ctx.db.collection('users').findOne(ObjectId(id))

    console.log(doc)

    ctx.body = {
        id,
        name: doc.name,
        avatarUrl: doc.avatarUrl,
    }
}

export async function setupUsers(router) {
    router.get('/users/:id', getUser)
}
