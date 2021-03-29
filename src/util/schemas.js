const Joi = require('joi')

const config = require('../config')

module.exports = {
  emotes: Joi.object({
    accessKey: Joi.any().valid(`Bearer ${config.accessKey}`).required()
  })
}
