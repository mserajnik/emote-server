const path = require('path')
const fs = require('fs')
const fsp = fs.promises
const fg = require('fast-glob')
const FileType = require('file-type')
const gifFrames = require('gif-frames')

const config = require('../config')

module.exports = {
  async list () {
    const emotes = []

    let emotePaths

    try {
      emotePaths = await fg(
        `${config.emotesPath}/*.{${config.supportedFileExtensions}}`
      )
    } catch {
      return {
        success: false,
        message: 'ListError',
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
      path.extname(file.name).substr(1)
    )) {
      return {
        success: false,
        message: 'AddError',
        code: 400
      }
    }

    try {
      await fsp.writeFile(`${config.emotesPath}/${file.name}`, file.data)
    } catch {
      return {
        success: false,
        message: 'AddError',
        code: 500
      }
    }

    return {
      success: true,
      message: 'Add',
      code: 200
    }
  },
  async delete (fileName) {
    const filePath = `${config.emotesPath}/${fileName}`

    try {
      await fsp.access(filePath, fs.constants.F_OK)
    } catch {
      return {
        success: false,
        message: 'DeleteError',
        code: 500
      }
    }

    const isGifEmote = await this.isGifEmote(fileName)

    try {
      await fsp.unlink(filePath)
    } catch {
      return {
        success: false,
        message: 'DeleteError',
        code: 500
      }
    }

    if (isGifEmote) {
      const frozenFilePath = `${config.frozenEmotesPath}/${fileName}.png`

      if (await this.frozenEmoteExists(fileName)) {
        try {
          await fsp.unlink(frozenFilePath)
        } catch {
          return {
            success: false,
            message: 'DeleteError',
            code: 500
          }
        }

        return {
          success: true,
          message: 'Delete',
          code: 200
        }
      }
    }

    return {
      success: true,
      message: 'Delete',
      code: 200
    }
  },
  async isGifEmote (fileName) {
    const filePath = `${config.emotesPath}/${fileName}`

    try {
      await fsp.access(filePath, fs.constants.F_OK)
      const fileType = await FileType.fromFile(filePath)

      if (!fileType || fileType.mime !== 'image/gif') {
        return false
      }
    } catch {
      return false
    }

    return true
  },
  async frozenEmoteExists (fileName) {
    const frozenFilePath = `${config.frozenEmotesPath}/${fileName}.png`

    try {
      await fsp.access(frozenFilePath, fs.constants.F_OK)
    } catch {
      return false
    }

    return true
  },
  async ensureFrozenEmoteExists (fileName) {
    const filePath = `${config.emotesPath}/${fileName}`
    const frozenFilePath = `${config.frozenEmotesPath}/${fileName}.png`

    if (await this.frozenEmoteExists(fileName)) {
      return true
    }

    let frameData

    try {
      frameData = await gifFrames({
        url: filePath,
        frames: 0,
        outputType: 'png'
      })
    } catch {
      return false
    }

    try {
      await (async () => {
        return new Promise((resolve, reject) => {
          const ws = fs.createWriteStream(frozenFilePath)

          ws
            .on('finish', () => resolve(true))
            .on('error', () => reject(false))

          frameData[0].getImage().pipe(ws)
        })
      })()

      return true
    } catch {
      return false
    }
  }
}
