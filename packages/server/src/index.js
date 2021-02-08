import { app } from './app'
import env from './env'
import { connectMongo, createMongoIndexes } from './mongo'

connectMongo(env).then(async (db) => {
    await createMongoIndexes(db)

    app.context.db = db

    app.listen(env.httpPort, () => {
        console.log(`listening to port ${env.httpPort}`)
    })
})
