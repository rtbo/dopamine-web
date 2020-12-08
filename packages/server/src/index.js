import cors from '@koa/cors'
import Koa from 'koa'
import bodyParser from 'koa-bodyparser'
import helmet from 'koa-helmet'
import logger from 'koa-logger'

import { MongoClient } from 'mongodb'
import env from './env'
import { buildApiV1Router } from './v1'

const app = new Koa()

app.use(helmet())
app.use(cors())
app.use(bodyParser())
app.use(logger())

const v1Router = buildApiV1Router()

app.use(v1Router.routes()).use(v1Router.allowedMethods())

const mongoClient = new MongoClient(env.mongoDbUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})

mongoClient.connect().then(() => {
    app.context.db = mongoClient.db(env.mongDbName)
    app.listen(env.httpPort, () => {
        console.log(`listening to port ${env.httpPort}`)
    })
})
