#!/usr/bin/env node

/*!
 * emote-server
 * Copyright (C) 2020-present  Michael Serajnik  https://mserajnik.dev
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

const bodyParser = require('body-parser')
const service = require('restana')()
const send = require('send')

require('dotenv').config()

const config = require('./src/config')
const schemas = require('./src/util/schemas')
const emotes = require('./src/util/emotes')

service.use(bodyParser.json())

service.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Accept, Authorization, Content-Type, Origin, X-Requested-With'
  )
  res.setHeader(
    'Access-Control-Allow-Methods', 'GET, HEAD, POST, OPTIONS'
  )

  if (req.method === 'OPTIONS') {
    return res.send()
  }

  next()
})

service.get('/', (req, res) => {
  res.send({
    emoteServer: {
      version: config.version,
      apiVersion: config.apiVersion
    }
  })
})

service.get('/emotes', async (req, res) => {
  if (config.accessKey !== '') {
    try {
      await schemas.emotes.validateAsync({
        accessKey: req.headers.authorization
      })
    } catch (err) {
      return res.send({
        error: `${err.details[0].path[0]}`
      }, 400)
    }
  }

  res.send(await emotes.list())
})

service.get('/emotes/:emote', async (req, res) => {
  if (config.accessKey !== '') {
    try {
      await schemas.emotes.validateAsync({
        accessKey: req.headers.authorization
      })
    } catch (err) {
      return res.send({
        error: `${err.details[0].path[0]}`
      }, 400)
    }
  }

  send(req, `${config.emotesPath}/${req.params.emote}`)
    .on('error', () => res.send({ error: 'fileNotFound' }, 404))
    .pipe(res)
})

module.exports = service
