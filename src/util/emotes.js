const path = require('path')
const fs = require('fs')
const fsp = fs.promises
const fg = require('fast-glob')

const config = require('../config')

module.exports = {
  async list () {
    const emotes = []

    let emotePaths

    try {
      emotePaths = await fg(
        `${config.emotesPath}/*.{${config.supportedFileExtensions}}`
      )
    } catch (err) {
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
    } catch (err) {
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
    } catch (err) {
      return {
        success: false,
        message: 'DeleteError',
        code: 500
      }
    }

    try {
      await fsp.unlink(filePath)
    } catch (err) {
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
