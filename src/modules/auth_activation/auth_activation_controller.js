const helper = require('../../helpers/wrapper')
// const bcrypt = require('bcrypt')
const authModel = require('./auth_activation_model')
require('dotenv').config()
// const jwt = require('jsonwebtoken')
// const nodemailer = require('nodemailer')

module.exports = {
  activateAccount: async (req, res) => {
    try {
      const { id } = req.query
      const result = await authModel.activateData(id)
      return helper.response(res, 200, 'Success Activate User', result)
    } catch (error) {
      return helper.response(res, 400, 'Bad Request', error)
    }
  }
}
