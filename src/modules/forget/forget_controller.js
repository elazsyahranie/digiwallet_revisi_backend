const helper = require('../../helpers/wrapper')
const bcrypt = require('bcrypt')
const forgetModel = require('./forget_model')
require('dotenv').config()
// const jwt = require('jsonwebtoken')

module.exports = {
  forgetPassword: async (req, res) => {
    try {
      const { id } = req.params
      const { userPassword } = req.body
      const salt = bcrypt.genSaltSync(10)
      const encryptPassword = bcrypt.hashSync(userPassword, salt)
      console.log(`before Encrypt = ${userPassword}`)
      console.log(`after Encrypt = ${encryptPassword}`)
      const setData = {
        user_password: encryptPassword
      }
      console.log(setData)
      const result = await forgetModel.forgetpassword(setData, id)
      delete result.user_password
      return helper.response(res, 200, 'Success Restart Password', result)
    } catch (error) {
      return helper.response(res, 400, 'Bad Request', error)
    }
  }
}
