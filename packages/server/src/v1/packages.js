import Joi from 'joi'
import { ObjectId } from 'mongodb'
import semver from 'semver'
import validateRequest from '../validate-request'
import { requireAuth } from './auth'

const packageProj = {
    name: 1,
    maintainerId: 1,
}

const packageBody = ({ _id: id, name, maintainerId }) => ({
    id,
    name,
    maintainerId,
})

const recipeBody = ({
    packageId,
    version,
    revision,
    recipe,
    maintainerId,
    created,
}) => ({
    packageId,
    version,
    revision,
    recipe,
    maintainerId,
    created,
})

function joiSemver(value) {
    if (!semver.valid(value)) throw new Error(`${value} is not a valid Semver`)
    return value
}

export function setupPackages(router) {
    router.get(
        '/packages',
        validateRequest({
            query: { name: Joi.string() },
        }),
        async (ctx) => {
            const { name } = ctx.request.query
            ctx.assert(name, 400, 'Missing name query parameter')
            const doc = await ctx.db.collection('packages').findOne(
                {
                    name,
                },
                {
                    projection: packageProj,
                }
            )
            ctx.assert(doc, 404, `No such package: "${name}"`)

            ctx.body = packageBody(doc)
        }
    )

    router.get(
        '/packages/:id',
        validateRequest({
            params: {
                id: Joi.string().required(),
            },
        }),
        async (ctx) => {
            const { id } = ctx.request.params
            const doc = await ctx.db
                .collection('packages')
                .findOne(ObjectId(id), {
                    projection: packageProj,
                })
            ctx.assert(doc, 404, 'No such package')
            ctx.body = packageBody(doc)
        }
    )

    router.post(
        '/packages',
        requireAuth,
        validateRequest({
            body: { name: Joi.string().required() },
        }),
        async (ctx) => {
            const { name } = ctx.request.body
            ctx.assert(name, 400, 'Missing name query parameter')

            const maintainerId = ctx.state.auth

            try {
                const doc = await ctx.db.collection('packages').insertOne({
                    name,
                    maintainerId,
                })

                ctx.body = packageBody(doc.ops[0])
            } catch (err) {
                if (err.name === 'MongoError' && err.code === 11000) {
                    ctx.throw(400, `Package "${name}" already exists`)
                }
            }
        }
    )

    router.post(
        '/packages/:id/recipes',
        requireAuth,
        validateRequest({
            params: {
                id: Joi.string().required(),
            },
            body: {
                version: Joi.string().custom(joiSemver).required(),
                revision: Joi.string().required(),
                recipe: Joi.string().required(),
                zipUpload: Joi.bool(),
            },
        }),
        async (ctx) => {
            const { id } = ctx.request.params
            const { version, revision, recipe, zipUpload } = ctx.request.body

            const packageDoc = await ctx.db
                .collection('packages')
                .findOne(ObjectId(id), {
                    _id: 1,
                })

            ctx.assert(packageDoc, 404, 'No such package')

            ctx.assert(!zipUpload, 500, 'Unimplemented')

            try {
                const doc = await ctx.db.collection('recipes').insertOne({
                    packageId: ObjectId(id),
                    version,
                    revision,
                    recipe,
                    maintainerId: ctx.state.auth,
                    created: new Date(),
                })

                ctx.body = recipeBody(doc.ops[0])
            } catch (err) {
                if (err.name === 'MongoError' && err.code === 11000) {
                    ctx.throw(400, `Recipe revision already exists`)
                }
            }
        }
    )

    router.get(
        '/packages/:id/recipes/:version',
        validateRequest({
            params: {
                id: Joi.string().required(),
                version: Joi.string().custom(joiSemver).required(),
            },
            query: {
                revision: Joi.string(),
            },
        }),
        async (ctx) => {
            const { id, version } = ctx.request.params
            const { revision } = ctx.request.query

            const cursor = await ctx.db
                .collection('recipes')
                .find({
                    packageId: ObjectId(id),
                    version,
                    revision,
                })
                .sort({
                    created: -1,
                })

            ctx.assert(await cursor.hasNext(), 404, 'no such recipe')

            const recipe = await cursor.next()

            ctx.body = {
                version: recipe.version,
                revision: recipe.revision,
                recipe: recipe.recipe,
                maintainerId: recipe.maintainerId,
                created: recipe.created,
            }
        }
    )

    router.get(
        '/packages/:id/versions',
        validateRequest({
            params: {
                id: Joi.string().required(),
            },
            query: {
                latest: Joi.string().valid('true'),
            },
        }),
        async (ctx) => {
            const { id } = ctx.request.params
            const { latest } = ctx.request.query

            const versions = await ctx.db
                .collection('recipes')
                .distinct('version', {
                    packageId: ObjectId(id),
                })
                .sort(semver.rcompare)

            if (latest && versions.length) {
                ctx.body = [versions[0]]
            } else {
                ctx.body = versions
            }
        }
    )
}
