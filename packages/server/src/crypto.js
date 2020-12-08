import jwt from 'jsonwebtoken'

export function signJwt(payload, secret, signOptions) {
    return new Promise((resolve, reject) => {
        jwt.sign(payload, secret, signOptions, (err, encoded) => {
            if (err) reject(err)
            else resolve(encoded)
        })
    })
}

export function verifyJwt(token, secret, verifyOptions) {
    return new Promise((resolve, reject) => {
        jwt.verify(token, secret, verifyOptions, (err, decoded) => {
            if (err) reject(err)
            else resolve(decoded)
        })
    })
}
