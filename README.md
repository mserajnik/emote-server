# emote-server [![Docker Hub build][docker-hub-badge]][docker-hub]

> A simple application to list and serve emotes

This is a small application to serve emotes (or other files) over a simple HTTP
API.

## Table of contents

+ [Install](#install)
  + [Installing with Docker](#installing-with-docker)
  + [Installing without Docker](#installing-without-docker)
  + [Dependencies](#dependencies)
  + [Updating](#updating)
    + [Updating with Docker](#updating-with-docker)
    + [Updating without Docker](#updating-without-docker)
+ [Usage](#usage)
  + [Running with Docker](#running-with-docker)
  + [Running without Docker](#running-without-docker)
  + [Configuration](#configuration)
  + [API](#api)
    + [General](#general)
    + [Routes](#routes)
      + [Base](#base)
      + [Emotes](#emotes)
        + [Adding emotes](#adding-emotes)
        + [Deleting emotes](#deleting-emotes)
        + [Listing emotes](#listing-emotes)
        + [Getting emotes](#getting-emotes)
        + [Getting frozen GIF emotes](#getting-frozen-gif-emotes)
+ [Maintainer](#maintainer)
+ [Contribute](#contribute)
+ [License](#license)

## Install

The recommended way to run is via [Docker][docker]. Basic instructions on how
to run without it are also provided.

### Installing with Docker

To use this application with Docker, you can simply pull the prebuilt image
from [Docker Hub][docker-hub]:

```zsh
user@local:~$ docker pull mtbl/emote-server
```

Alternatively, you can also build the image yourself. The user that is used
inside the container has UID `1000` and GID `1000` by default. You can adjust
this (e.g., to match your host UID/GID) by providing the arguments `USER_ID`
and `GROUP_ID` when making a build.

### Installing without Docker

To install without Docker, you can simply clone the repository and install
dependencies.

```zsh
user@local:~$ git clone https://github.com/imtbl/emote-server.git
user@local:~$ cd emote-server
user@local:emote-server$ yarn
```

### Dependencies

+ [Docker][docker] (when using Docker)
+ [Node.js][node-js] (when not using Docker)
+ [Yarn][yarn] (when not using Docker)

This application should work with both the latest LTS and the latest stable
version of Node.js. If you encounter any issues with either of those versions
when not using Docker, please [let me know][issues].

### Updating

This application follows [semantic versioning][semantic-versioning] and any
breaking changes that require additional attention will be released under a new
major version (e.g., `2.0.0`). Minor version updates (e.g., `1.1.0` or `1.2.0`)
are therefore always safe to simply install.

When necessary, this section will be expanded with upgrade guides for new major
versions.

#### Updating with Docker

Simply pull the latest Docker image to update:

```zsh
user@local:~$ docker pull mtbl/emote-server
```

#### Updating without Docker

If you chose not to use Docker, you can update via Git:

```zsh
user@local:emote-server$ git pull
user@local:emote-server$ yarn
```

## Usage

### Running with Docker

To make using Docker as easy as possible, a working
[Docker Compose][docker-compose] example setup is provided. To get started with
this example setup, simply duplicate `docker-compose.yml.example` as
`docker-compose.yml` and adjust the variables in the `environment` section as
described [here](#configuration).

Finally, start the containers:

```zsh
user@local:emote-server$ docker-compose up -d
```

### Running without Docker

To run without Docker, you will first need to duplicate the `.env.example` as
`.env` and adjust the variables as described [here](#configuration).

After that, you can start the application:

```zsh
user@local:emote-server$ yarn start
```

### Configuration

Configuration is done entirely via environment variables. Please pay special
attention to the instructions to prevent issues.

+ `EMOTE_SERVER_PUBLIC_URL=http://localhost:8000`: the public URL the server
  will use to display file URLs. __No trailings slashes.__
+ `EMOTE_SERVER_PORT=8000`: the port the server is listening on.
+ `EMOTE_SERVER_ACCESS_KEY=`: an arbitrary string used as access key for the
  server's API. Can be of any (reasonable) length. If left empty, the
  respective routes will be publicly accessible.
+ `EMOTE_SERVER_NUMBER_OF_WORKERS=`: sets the number of workers. By default,
  one worker per logical CPU core is used. You might want to decrease or
  increase that number, depending on your needs/hardware. In general, the more
  workers are running, the more requests can be handled simultaneously. But
  note that increasing the number of workers beyond the number of logical CPUs
  might be detrimental to performance or cause even more serious issues (e.g.,
  crashes).
+ `EMOTE_SERVER_SUPPORTED_FILE_EXTENSIONS=png,gif`: sets the file extensions
  for the files the server should serve. The extensions need to be separated
  with `,`.
+ `EMOTE_SERVER_EMOTES_PATH=./emotes`: the path emotes are served from. Can be
  relative or absolute.

### API

#### General

Request and response bodies are always in JSON format (except when uploading
or downloading the actual files). The Authorization header in the format
`Authorization: Bearer <EMOTE_SERVER_ACCESS_KEY>` or the query parameter
`accessKey=<EMOTE_SERVER_ACCESS_KEY>` is used to authenticate for all routes
unless `EMOTE_SERVER_ACCESS_KEY` is empty, in which case these routes will be
publicly accessible as well.

The base route (`GET /`) does not require authentication, but can _optionally_
be used to verify access keys. To do this, simply pass an access key as you
normally would, in which case it will either respond normally when using a
valid access key or with an `AccessKeyError` when using an invalid one.

In case of any occuring errors, the response will have the following format
and an appropriate HTTP status code:

```json5
{
  "success": false,
  "error": <error name>
}
```

#### Routes

##### Base

Responds with the version number and the API version number of the
installation. The API version number will increase by 1 every time an existing
API endpoint is modified in a way it behaves differently than before or
removed altogether.

__Route:__ `GET /`

__Response on success:__

```json5
{
  "emoteServer": {
    "version": <version number of the application>,
    "apiVersion": <API version number of the application>
  }
}
```

__Possible errors:__

+ `AccessKeyError`

##### Emotes

###### Adding emotes

Adds a new emote. If a file with the same name already exists it will be
overwritten. The request has to be of type `multipart-form-data` and the file
needs to have the key `emote`.

__Route:__ `POST /emotes`

__Response on success:__

```json5
{
  "success": true,
  "message": "Add"
}
```

__Possible errors:__

+ `AccessKeyError`
+ `AddError`

###### Deleting emotes

Deletes the emote with the given filename. If the file does not exist, it will
respond with an error.

__Route:__ `DELETE /emotes/<emote filename>`

__Response on success:__

```json5
{
  "success": true,
  "message": "Delete"
}
```

__Possible errors:__

+ `AccessKeyError`
+ `DeleteError`

###### Listing emotes

Responds with the list of emotes available to be served.

__Route:__ `GET /emotes`

__Response on success:__

```json5
{
  "success": true,
  "emotes": [
    {
      "name": <name of the emote>,
      "url": <URL of the emote>
    }
    // [???]
  ]
}
```

__Possible errors:__

+ `AccessKeyError`
+ `ListError`

###### Getting emotes

Responds with the requested emote.

__Route:__ `GET /emotes/<emote filename>`

__Output on success:__ The requested emote

__Possible errors:__

+ `AccessKeyError`
+ `GetError`

###### Getting frozen GIF emotes

Responds with a "frozen" PNG version (containing the first frame) of the
requested GIF emote.

__Route:__ `GET /frozen-emotes/<GIF emote filename>`

__Output on success:__ The requested frozen GIF emote

__Possible errors:__

+ `AccessKeyError`
+ `GetError`
+ `GenerationError`

## Maintainer

[imtbl][maintainer]

## Contribute

You are welcome to help out!

[Open an issue][issues] or submit a pull request.

## License

[AGPLv3](LICENSE) ?? imtbl

[docker]: https://www.docker.com/
[docker-hub]: https://hub.docker.com/r/mtbl/emote-server/
[node-js]: https://nodejs.org/en/
[yarn]: https://yarnpkg.com/
[semantic-versioning]: https://semver.org/
[docker-compose]: https://docs.docker.com/compose/

[docker-hub-badge]: https://img.shields.io/docker/cloud/automated/mtbl/emote-server.svg

[maintainer]: https://github.com/imtbl
[issues]: https://github.com/imtbl/emote-server/issues/new
