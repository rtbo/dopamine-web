import Joi from 'joi'

export default function (spec) {
    const s = {}

    for (const [key, val] of Object.entries(spec)) {
        s[key] = Joi.object(val).required()
    }

    const schema = Joi.object(s).unknown()

    return async (ctx, next) => {
        const validation = schema.validate(ctx.request, {
            abortEarly: false,
        })
        ctx.assert(validation.error === undefined, 400, validation.error)

        await next()
    }
}
