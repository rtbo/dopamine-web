import Router from '@koa/router'
import { login } from './auth'
import { setupUsers } from './users'

export function buildApiV1Router() {
    const router = new Router({ prefix: '/api/v1' })

    router.post('/login', login)

    setupUsers(router)

    return router
}
