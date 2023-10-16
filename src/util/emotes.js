const path = require('path')
const fs = require('fs')
const fsp = fs.promises
const fg = require('fast-glob')
const FileType = require('file-type')

const config = require('../config')
const logger = require('./logger')

const gm = config.useImageMagick
  ? require('gm').subClass({ imageMagick: true })
  : require('gm')

module.exports = {
  async list () {
    const emotes = []

    let emotePaths

    try {
      emotePaths = await fg(
        `${config.emotesPath}/*.{${config.supportedFileExtensions}}`
      )
    } catch (err) {
      if (config.debug) {
        logger.log(err, 'error')
      }

      return {
        success: false,
        error: 'IO',
        code: 500
      }
    }

    for (const emotePath of emotePaths) {
      const filePath = path.basename(emotePath)

      emotes.push({
        name: path.parse(filePath).name,
        url: `${config.publicUrl}/emotes/${filePath}`
      })
    }

    return {
      success: true,
      emotes,
      code: 200
    }
  },
  async add (file) {
    if (!config.supportedFileExtensions.split(',').includes(
      path.extname(file.name).substring(1)
    )) {
      return {
        success: false,
        error: 'UnsupportedFileExtension',
        code: 400
      }
    }

    if (config.fileSizeLimit > 0) {
      if (Buffer.byteLength(file.data) > config.fileSizeLimit) {
        return {
          success: false,
          error: 'FileSizeLimitExceeded',
          code: 400
        }
      }
    }

    const filePath = `${config.emotesPath}/${file.name}`

    if (await this.exists(filePath)) {
      return {
        success: false,
        error: 'FileExists',
        code: 403
      }
    }

    try {
      await fsp.writeFile(filePath, file.data)
    } catch (err) {
      if (config.debug) {
        logger.log(err, 'error')
      }

      return {
        success: false,
        error: 'IO',
        code: 500
      }
    }

    return {
      success: true,
      code: 200
    }
  },
  async delete (fileName) {
    const filePath = `${config.emotesPath}/${fileName}`

    if (!await this.exists(filePath)) {
      return {
        success: false,
        error: 'FileNotFound',
        code: 404
      }
    }

    const isAnimatedEmote = await this.isAnimatedEmote(fileName)

    try {
      await fsp.unlink(filePath)
    } catch (err) {
      if (config.debug) {
        logger.log(err, 'error')
      }

      return {
        success: false,
        error: 'IO',
        code: 500
      }
    }

    if (isAnimatedEmote) {
      const frozenFilePath = `${config.frozenEmotesPath}/${fileName}.png`

      if (await this.exists(frozenFilePath)) {
        try {
          await fsp.unlink(frozenFilePath)
        } catch (err) {
          if (config.debug) {
            logger.log(err, 'error')
          }

          return {
            success: false,
            error: 'IO',
            code: 500
          }
        }

        return {
          success: true,
          code: 200
        }
      }
    }

    return {
      success: true,
      code: 200
    }
  },
  async deleteFrozenEmotes () {
    const emotePaths = await fg(`${config.frozenEmotesPath}/*.png`)

    for (const emotePath of emotePaths) {
      try {
        await fsp.unlink(emotePath)
      } catch (err) {
        if (config.debug) {
          logger.log(err, 'error')
        }

        return {
          success: false,
          error: 'IO',
          code: 500
        }
      }
    }

    return {
      success: true,
      code: 200
    }
  },
  async exists (filePath) {
    try {
      await fsp.access(filePath, fs.constants.F_OK)
    } catch {
      return false
    }

    return true
  },
  async getMimeType (filePath) {
    await fsp.access(filePath, fs.constants.F_OK)
    const fileType = await FileType.fromFile(filePath)

    return fileType.mime
  },
  async isAnimatedEmote (fileName) {
    const filePath = `${config.emotesPath}/${fileName}`

    try {
      const mimeType = await this.getMimeType(filePath)

      if (!mimeType || !['image/gif', 'image/apng'].includes(mimeType)) {
        return false
      }
    } catch {
      return false
    }

    return true
  },
  async ensureFrozenEmoteExists (fileName) {
    const filePath = `${config.emotesPath}/${fileName}`
    const frozenFilePath = `${config.frozenEmotesPath}/${fileName}.png`

    if (await this.exists(frozenFilePath)) {
      return true
    }

    let mimeType

    try {
      mimeType = await this.getMimeType(filePath)

      if (!mimeType || !['image/gif', 'image/apng'].includes(mimeType)) {
        return false
      }
    } catch {
      return false
    }

    try {
      await (async () => {
        return new Promise((resolve, reject) => {
          gm(filePath)
            .selectFrame(0)
            .write(frozenFilePath, err => {
              if (err) {
                if (config.debug) {
                  logger.log(err, 'error')
                }

                reject(new Error('Failed to write file.'))
              }

              resolve(true)
            })
        })
      })()

      return true
    } catch {
      return false
    }
  }
}
