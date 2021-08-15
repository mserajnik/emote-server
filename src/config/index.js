const path = require('path')

let emotesPath = process.env.EMOTE_SERVER_EMOTES_PATH

if (emotesPath.startsWith('.')) {
  emotesPath = path.resolve(__dirname, '../..', emotesPath)
}

let frozenEmotesPath = process.env.EMOTE_SERVER_FROZEN_EMOTES_PATH

if (frozenEmotesPath.startsWith('.')) {
  frozenEmotesPath = path.resolve(__dirname, '../..', frozenEmotesPath)
}

module.exports = {
  version: '1.4.0',
  apiVersion: 4,
  publicUrl: process.env.EMOTE_SERVER_PUBLIC_URL || 'http://localhost',
  port: process.env.EMOTE_SERVER_PORT || 8000,
  numberOfWorkers:
    process.env.EMOTE_SERVER_NUMBER_OF_WORKERS || require('os').cpus().length,
  accessKey: process.env.EMOTE_SERVER_ACCESS_KEY,
  supportedFileExtensions:
    process.env.EMOTE_SERVER_SUPPORTED_FILE_EXTENSIONS || 'png,gif',
  fileSizeLimit: process.env.EMOTE_SERVER_FILE_SIZE_LIMIT || 0,
  emotesPath: emotesPath || path.resolve(__dirname, '../..', './emotes'),
  frozenEmotesPath:
    frozenEmotesPath || path.resolve(__dirname, '../..', './frozen-emotes')
}
