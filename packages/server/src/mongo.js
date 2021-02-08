import { MongoClient } from 'mongodb'

export async function connectMongo({ mongoDbUri, mongoDbName }) {
    const client = new MongoClient(mongoDbUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })

    await client.connect()

    return client.db(mongoDbName)
}

export async function createMongoIndexes(db) {
    await db.collection('users').createIndex(
        {
            email: 1,
        },
        { unique: true }
    )
    await db.collection('packages').createIndex(
        {
            name: 1,
        },
        { unique: true }
    )
}
