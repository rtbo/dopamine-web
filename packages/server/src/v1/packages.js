import Joi from 'joi'
import { ObjectId } from 'mongodb'
import validateRequest from '../validate-request'
import { requireAuth } from './auth'

const packageProj = {
    name: 1,
    maintainerId: 1,
    'versions.version': 1,
}

const packageBody = ({ _id: id, name, maintainerId, versions }) => ({
    id,
    name,
    maintainerId,
    versions: versions?.map((v) => v.version) || [],
})

const versionProj = (version) => ({
    name: 1,
    maintainerId: 1,
    versions: {
        $elemMatch: {
            version,
        },
    },
})

const versionBody = ({ _id: id, name, maintainerId }, version) => ({
    packageId: id,
    name,
    maintainerId,
    luaDef: version.luaDef,
    recipe: version.recipe,
})

const versionPattern = /^[0-9]+.[0-9]+.[0-9]+(-[a-zA-Z0-9_.]+)*$/

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
                    versions: [],
                })

                ctx.body = packageBody(doc.ops[0])
            } catch (err) {
                if (err.name === 'MongoError' && err.code === 11000) {
                    ctx.throw(400, `Package "${name}" already exists`)
                }
            }
        }
    )

    router.get(
        '/packages/:id/versions/:version',
        validateRequest({
            params: {
                id: Joi.string().required(),
                version: Joi.string().required(),
            },
        }),
        async (ctx) => {
            const { id, version } = ctx.request.params

            const doc = await ctx.db
                .collection('packages')
                .findOne(ObjectId(id), {
                    projection: versionProj(version),
                })

            ctx.assert(
                doc && doc.versions.length,
                404,
                'No such package version'
            )

            const packageVer = doc.versions[0]

            ctx.body = versionBody(doc, packageVer)
        }
    )

    router.post(
        '/packages/:id/versions',
        requireAuth,
        validateRequest({
            params: {
                id: Joi.string().required(),
            },
            body: {
                name: Joi.string().required(),
                version: Joi.string().required(),
                luaDef: Joi.string().required(),
                recipe: Joi.object({
                    name: Joi.string().required(),
                    version: Joi.string().pattern(versionPattern).required(),
                    license: Joi.string().required(),
                    copyright: Joi.string(),
                    description: Joi.string(),
                    langs: Joi.array().required(),
                    repo: Joi.object({
                        type: Joi.string().valid('source').required(),
                    })
                        .required()
                        .unknown(),
                    source: Joi.object({
                        type: Joi.string().valid('source').required(),
                    }).unknown(),
                    build: Joi.object({
                        type: Joi.string().valid('build').required(),
                    })
                        .required()
                        .unknown(),
                }).required(),
            },
        }),
        async (ctx) => {
            const { id } = ctx.request.params
            const { version, luaDef, recipe } = ctx.request.body

            ctx.assert(
                version === recipe.version,
                400,
                'version and recipe.version must be the same'
            )

            const collec = ctx.db.collection('packages')

            const ver = await collec.findOne({
                _id: ObjectId(id),
                'versions.version': version,
            })

            ctx.assert(
                !ver,
                400,
                `package version "${recipe.name}§${version}" already exists`
            )

            const doc = await collec.findOneAndUpdate(
                {
                    _id: ObjectId(id),
                },
                {
                    $push: {
                        versions: {
                            version,
                            luaDef,
                            recipe,
                        },
                    },
                },
                {
                    returnOriginal: false,
                    projection: versionProj(version),
                }
            )

            ctx.assert(
                doc.value &&
                    doc.value.versions &&
                    doc.value.versions.length === 1
            )
            const pack = doc.value
            const insertedVersion = pack.versions[0]
            ctx.body = versionBody(doc, insertedVersion)
        }
    )
}
