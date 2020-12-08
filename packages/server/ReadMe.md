# Dopamine PM server

## API v1

In the following API, authentication means to pass to the API an access token
that was received either by the `/v1/login` endpoint or through the frontend
interface.

### Users

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
prompted to save it in safe place.

---

```
GET     /v1/users/{id}/cli-keys
```
Get the CLI keys for the authenticated user, who MUST match with
the id provided.
Data received:
```json
{
    "keys": [
        { "id": "(key id)", "name": "name", "key": "a key ... extract" },
        { "id": "(key id)", "name": "name", "key": "a key ... extract" }
    ]
}
```
__Note__: The entire key is only sent once when created. The user should be
prompted to save it in safe place.

---

### Packages

This section treats the package definitions, that is their recipe to create binaries, but not the built packages themselves.

```
POST    /v1/packages
```
Create a new package

---

```
PUT     /v1/packages/update
```
Update a new package (its metadata mainly)

---

```
GET     /v1/packages/{id}
```
Read a package

---

```
POST    /v1/packages/{id}/versions
```
Publish a new version for a package

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
