import path from 'path'
import { config } from 'dotenv'

function envFilePath() {
    const file = process.env.NODE_ENV ? `${process.env.NODE_ENV}.env` : '.env'
    return path.resolve(__dirname, '../env', file)
}

config({
    path: envFilePath(),
})

export default {
    mongoDbUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1/dopamine',
    mongoDbName: process.env.MONGODB_NAME || 'dopamine',

    jwtSecret: process.env.JWT_SECRET,

    githubClientId: process.env.GITHUB_CLIENTID || '3f2f6c2ce1e0bdf8ae6c',
    githubClientSecret: process.env.GITHUB_CLIENTSECRET,

    httpHost: process.env.HTTP_HOST || 'localhost',
    httpPort: parseInt(process.env.HTTP_PORT || '3000'),
}
