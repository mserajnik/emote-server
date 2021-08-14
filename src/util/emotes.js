const path = require('path')
const fs = require('fs')
const fsp = fs.promises
const fg = require('fast-glob')
const FileType = require('file-type')
const gifFrames = require('gif-frames')
// apng-js requires a Blob polyfill; this is sadly not mentioned in the docs
globalThis.Blob = require('cross-blob')
const parseApng = require('apng-js').default

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
      path.extname(file.name).substr(1)
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

    try {
      await fsp.writeFile(`${config.emotesPath}/${file.name}`, file.data)
    } catch {
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
    } catch {
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
        } catch {
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
      } catch {
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

    let frameDataStream

    try {
      switch (mimeType) {
        case 'image/gif':
          frameDataStream = (await gifFrames({
            url: filePath,
            frames: 0,
            outputType: 'png'
          }))[0].getImage()
          break
        case 'image/apng':
          frameDataStream = (parseApng(
            await fsp.readFile(filePath)
          )).frames[0].imageData.stream()
      }
    } catch {
      return false
    }

    try {
      await (async () => {
        return new Promise((resolve, reject) => {
          const ws = fs.createWriteStream(frozenFilePath)

          ws
            .on('finish', () => resolve(true))
            .on('error', () => reject(new Error('Failed to write file.')))

          switch (mimeType) {
            case 'image/gif':
              frameDataStream.pipe(ws)
              break
            case 'image/apng':
              frameDataStream.pipe(ws)
          }
        })
      })()

      return true
    } catch {
      return false
    }
  }
}
