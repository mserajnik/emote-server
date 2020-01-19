const path = require('path')
const fg = require('fast-glob')

const config = require('../config')

module.exports = {
  async list () {
    const emotesList = []

    const emotePaths = await fg(
      `${config.emotesPath}/*.{${config.supportedFileExtensions}}`
    )

    for (const emotePath of emotePaths) {
      const filePath = path.basename(emotePath)

      emotesList.push({
        name: path.parse(filePath).name,
        url: `${config.publicUrl}/emotes/${filePath}`
      })
    }

    return {
      emotes: emotesList
    }
  }
}
