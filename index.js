#!/usr/bin/env node

/*!
 * emote-server
 * Copyright (C) 2019-present  imtbl  https://github.com/imtbl
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
const queryParser = require('connect-query')
const fileUpload = require('express-fileupload')
const service = require('restana')()
const send = require('send')

require('dotenv').config()

const config = require('./src/config')
const schemas = require('./src/util/schemas')
const emotes = require('./src/util/emotes')

service.use(bodyParser.json())
service.use(fileUpload({
  safeFileNames: true,
  preserveExtension: Math.max(...config.supportedFileExtensions.split(',').map(
    extension => extension.length
  ))
}))
service.use(queryParser())

service.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Accept, Authorization, Content-Type, Origin, X-Requested-With'
  )
  res.setHeader(
    'Access-Control-Allow-Methods', 'GET, HEAD, POST, DELETE, OPTIONS'
  )

  if (req.method === 'OPTIONS') {
    return res.send()
  }

  next()
})

service.get('/', async (req, res) => {
  if (
    (req.headers.authorization || req.query.accessKey) &&
    config.accessKey !== ''
  ) {
    try {
      await schemas.emotes.validateAsync({
        accessKey: req.headers.authorization ||
          (req.query.accessKey ? `Bearer ${req.query.accessKey}` : null)
      })
    } catch (err) {
      return res.send({
        success: false,
        error: 'AccessKeyError'
      }, 401)
    }
  }

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
        accessKey: req.headers.authorization ||
          (req.query.accessKey ? `Bearer ${req.query.accessKey}` : null)
      })
    } catch (err) {
      return res.send({
        success: false,
        error: 'AccessKeyError'
      }, 401)
    }
  }

  const listResponse = await emotes.list()

  res.send({
    success: listResponse.success,
    [listResponse.success ? 'emotes' : 'message']: listResponse.success
      ? listResponse.emotes
      : listResponse.message
  }, listResponse.status)
})

service.post('/emotes', async (req, res) => {
  if (config.accessKey !== '') {
    try {
      await schemas.emotes.validateAsync({
        accessKey: req.headers.authorization ||
          (req.query.accessKey ? `Bearer ${req.query.accessKey}` : null)
      })
    } catch (err) {
      return res.send({
        success: false,
        error: 'AccessKeyError'
      }, 401)
    }
  }

  if (!req.files && req.files.emote) {
    return res.send({
      success: false,
      message: 'AddError'
    }, 400)
  }

  const addResponse = await emotes.add(req.files.emote)

  res.send({
    success: addResponse.success,
    message: addResponse.message
  }, addResponse.code)
})

service.get('/emotes/:emote', async (req, res) => {
  if (config.accessKey !== '') {
    try {
      await schemas.emotes.validateAsync({
        accessKey: req.headers.authorization ||
          (req.query.accessKey ? `Bearer ${req.query.accessKey}` : null)
      })
    } catch (err) {
      return res.send({
        success: false,
        error: 'AccessKeyError'
      }, 401)
    }
  }

  send(req, `${config.emotesPath}/${req.params.emote}`)
    .on('error', () => res.send({ error: 'GetError' }, 404))
    .pipe(res)
})

service.delete('/emotes/:emote', async (req, res) => {
  if (config.accessKey !== '') {
    try {
      await schemas.emotes.validateAsync({
        accessKey: req.headers.authorization ||
          (req.query.accessKey ? `Bearer ${req.query.accessKey}` : null)
      })
    } catch (err) {
      return res.send({
        success: false,
        error: 'AccessKeyError'
      }, 401)
    }
  }

  const deleteResponse = await emotes.delete(req.params.emote)

  res.send({
    success: deleteResponse.success,
    message: deleteResponse.message
  }, deleteResponse.code)
})

module.exports = service
