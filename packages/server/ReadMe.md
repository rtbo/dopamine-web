# Dopamine PM server

## API v1

### Authentication
In the following API, authentication means to pass to the API an access token
that was received either by the `/v1/login` endpoint or through the frontend
interface.

```
POST    /v1/login
```
Get access-token. Create a new user in the DB if e-mail not known.
Request body:
```json
{
    "provider": "github",
    "code": "(code obtained from https://github.com/login/oauth/authorize)",
    "state": "(the state that was passed to github for authorization)"
}
 ```
It is planned to support more login methods later. This is typically called
from the browser only, in order to login to the frontend.

---

### Users

```
GET     /v1/users/{id}
```
Get user info. Can be called without authentication.
Data received:
```json
{
    "id": "(user id)",
    "name": "(User full name - the one given to the login provider)",
    "avatarUrl": "(a link to the user avatar picture)",
}
```

---

```
POST    /v1/users/{id}/cli-keys
```
Request body:
```json
{ "name": "A name to give to the key" }
```

Create a new CLI key for the authenticated user, who MUST match with
the id provided.
The name must be unique per user.

Data received:
```json
{ "name": "the name given", "key": "(the key)" }
```
__Note__: The entire key is only sent once when created. The user should be
prompted to save it in safe place at this time.

---

```
GET     /v1/users/{id}/cli-keys
```
Get the CLI keys for the authenticated user, who MUST match with
the id provided.
Data received:
```json
{
    "cliKeys": [
        { "name": "name", "key": "a key ... extract" },
        { "name": "name", "key": "a key ... extract" }
    ]
}
```

---

```
DELETE  /v1/users/{id}/cli-keys/{name}
```
Delete the CLI key identified by name for the authenticated user, who MUST match with
the id provided.
The remaining keys are received
```json
{
    "cliKeys": [
        { "name": "name", "key": "a key ... extract" },
        { "name": "name", "key": "a key ... extract" }
    ]
}
```

---

### Packages

This section treats the package definitions, that is their recipe to create binaries, but not the built packages themselves.

```
POST    /v1/packages
```
Create a new package. User must be authenticated.

Expected request body:
```json
{
    "name": "[package-name]"
}
```
Returned data:
```json
{
    "id": "[the package id]",
    "name": "[package-name]",
    "versions": []
}
```

---

```
GET     /v1/packages/{id}
```
Read a package

Returned data:
```json
{
    "id": "[the package id]",
    "name": "[package-name]",
    "versions": [
        "1.0.0",
        "1.0.1",
        "1.1.0",
        ...
    ]
}
```

---

```
POST    /v1/packages/{id}/recipes
```
Publish a new version for a package

Expected request:
```json
{
    "version": "[semver version]",
    "revision": "[unique revision]",
    "recipe": "[lua recipe content]",
    "arUpload": "[boolean to tell if archive upload is needed - only if there is more than the lua recipe]",
}
```
Response
```json
{
    "version": "[semver version]",
    "revision": "[unique revision]",
    "recipe": "[lua recipe content]",
    "maintainerId": "[user id of creator]",
    "created": "[creation date]",
    "arUploadToken": "[secured token valid 10 minutes to use as bearer to upload archive content]"
}
```

---
```
GET     /v1/packages/{id}/recipes/{version}?revision={}
```
Get a recipe. Revision query param is optional. Will default to
latest revision if no revision specified
Response
```json
{
    "version": "[semver version]",
    "revision": "[unique revision]",
    "recipe": "[lua recipe content]",
    "maintainerId": "[user id of creator]",
    "created": "[creation date]",
    "arDownload": "[download link for archive content (if any)]"
}
```

---

```
GET     /v1/packages/{id}/versions
```
Get the available versions of a package

---

```
GET     /v1/packages/{id}/versions?latest=true
```
Get the latest version of a package

---

```
GET     /v1/packages?name={}
```
Get a package by name

### Profiles
