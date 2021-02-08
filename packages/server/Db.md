# Database structure

Dopamine backend uses MongoDb database engine.
The structure is described informally in the following JS dataset.
The root objects (users, packages, ...) are the MongoDb collections.

```js
{
    users: [
        {
            _id: ObjectId(),
            email: "[email address]",
            avatarUrl: "[link to an avatar hosted by sign-in provider]",
            name: "[user's full name]",
            cliKeys: [
                {
                    name: "key name",
                    key: "[jwt for accessing the api]",
                }
            ]
        }
    ],
    packages: [
        {
            _id: ObjectId(),
            name: "[package name]",
            maintainerId: "[id of maintainer user]",
        }
    ],
    recipes: [
        {
            _id: ObjectId(),
            packageId: ObjectId(),
            maintainerId: ObjectId(),
            version: "[semver]",
            revision: "[revision id - generally SHA1]",
            recipe: "[lua definition]",
            exportZip: "[zip data - only if data is exported]",
        }
    ]
}
```
