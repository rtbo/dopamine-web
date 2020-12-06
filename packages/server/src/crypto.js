import jwt from 'jsonwebtoken'

export function signJwt(payload, secret, signOptions) {
    return new Promise((resolve, reject) => {
        jwt.sign(payload, secret, signOptions, (err, encoded) => {
            if (err) reject(err)
            else resolve(encoded)
        })
    })
}

export function verifyJwt(token, secret) {
    return new Promise((resolve, reject) => {
        jwt.verify(token, secret, (err, decoded) => {
            if (err) reject(err)
            else resolve(decoded)
        })
    })
}
