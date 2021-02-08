import env from '../src/env'
import { connectMongo } from '../src/mongo'

console.log(env)

export let db

before('startup', async function () {
    db = await connectMongo(env)
    db.dropDatabase(env.mongoDbName)
})
