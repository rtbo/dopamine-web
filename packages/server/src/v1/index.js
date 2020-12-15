import Router from '@koa/router'
import { setupAuth } from './auth'
import { setupPackages } from './packages'
import { setupUsers } from './users'

export function buildApiV1Router() {
    const router = new Router({ prefix: '/api/v1' })

    setupAuth(router)
    setupUsers(router)
    setupPackages(router)

    return router
}
