import Router from '@koa/router'
import { setupAuth } from './auth'
import { setupUsers } from './users'

export function buildApiV1Router() {
    const router = new Router({ prefix: '/api/v1' })

    setupAuth(router)
    setupUsers(router)

    return router
}
