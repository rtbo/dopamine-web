import cors from '@koa/cors'
import Koa from 'koa'
import bodyParser from 'koa-bodyparser'
import helmet from 'koa-helmet'
import logger from 'koa-logger'

import { buildApiV1Router } from './v1'

export const app = new Koa()

app.use(helmet())
app.use(cors())
app.use(bodyParser())
app.use(logger())

const v1Router = buildApiV1Router()

app.use(v1Router.routes()).use(v1Router.allowedMethods())
