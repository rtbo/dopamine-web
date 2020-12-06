# Dopamine PM server

## API v1

In the following API, authentication means to pass to the API an access token
that was received either by the `/v1/login` endpoint or through the frontend
interface.

### Users

```
POST    /v1/login
```
Get access-token. Create a new user if e-mail not known.
Must be called with the following data in JSON form:
```json
{
    "provider": "github",
    "code": "(code obtained from https://github.com/login/oauth/authorize)",
    "state": "(the state that was passed to github for authorization)"
}
 ```
It is planned to support more login methods later. This is typically called
from the browser only to login to the frontend.

---

```
GET     /v1/users/{id}
```
Get user info. Can be called without authentication.
Data received:
```json
{
    "id": "(user id in the database)",
    "name": "(User full name - the one given to the login provider)",
    "avatarUrl": "(a link to the user avatar picture)"
}
```
Authenticated users will in addition receive their own E-mail address.

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
