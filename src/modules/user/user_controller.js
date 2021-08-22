const helper = require('../../helpers/wrapper')
// const helperUser = require('../../helpers/wrapperUser')
const bcrypt = require('bcrypt')
const redis = require('redis')
const client = redis.createClient()
const userModel = require('./user_model')
require('dotenv').config()
const jwt = require('jsonwebtoken')
const nodemailer = require('nodemailer')

module.exports = {
  getAllUser: async (req, res) => {
    try {
      let { page, limit } = req.query
      page = parseInt(page)
      limit = parseInt(limit)
      const totalData = await userModel.getDataCount()
      console.log('Total Data: ' + totalData)
      const totalPage = Math.ceil(totalData / limit)
      console.log('Total Page: ' + totalPage)
      const offset = page * limit - limit
      const pageInfo = {
        page,
        totalPage,
        limit,
        totalData
      }
      const result = await userModel.getDataAll(limit, offset)
      return helper.response(res, 200, 'Success Get Data', result, pageInfo)
    } catch (error) {
      return helper.response(res, 400, 'Bad Request', error)
    }
  },
  getAllUsernameAscending: async (req, res) => {
    try {
      let { page, limit } = req.query
      page = parseInt(page)
      limit = parseInt(limit)
      const totalData = await userModel.getDataCount()
      console.log('Total Data: ' + totalData)
      const totalPage = Math.ceil(totalData / limit)
      console.log('Total Page: ' + totalPage)
      const offset = page * limit - limit
      const pageInfo = {
        page,
        totalPage,
        limit,
        totalData
      }
      const result = await userModel.getDataAllAscending(limit, offset)
      return helper.response(res, 200, 'Success Get Data', result, pageInfo)
    } catch (error) {
      return helper.response(res, 400, 'Bad Request', error)
    }
  },
  getUsernameSearchKeyword: async (req, res) => {
    try {
      const { keyword } = req.query
      const result = await userModel.getUserSearchKeyword(keyword)
      client.set(`getusersearch:${keyword}`, JSON.stringify(result))
      return helper.response(
        res,
        200,
        'Success Find Username By Keyword',
        result
      )
    } catch (error) {
      return helper.response(res, 400, 'Bad Request', error)
    }
  },
  register: async (req, res) => {
    try {
      const { userName, userEmail, userPassword } = req.body
      const salt = bcrypt.genSaltSync(10)
      const encryptPassword = bcrypt.hashSync(userPassword, salt)
      const setData = {
        user_name: userName,
        user_email: userEmail,
        user_password: encryptPassword
      }

      const checkEmailUser = await userModel.getDataByCondition({
        user_email: userEmail
      })

      if (checkEmailUser.length === 0) {
        const result = await userModel.register(setData)
        // console.log(result)
        // console.log(result.id)
        delete result.user_password
        const transporter = nodemailer.createTransport({
          host: 'smtp.gmail.com',
          port: 587,
          secure: false, // true for 465, false for other ports
          auth: {
            user: process.env.SMTP_EMAIL, // generated ethereal user
            pass: process.env.SMTP_PASSWORD // generated ethereal password
          }
        })

        const mailOptions = {
          from: "'DIGIWALLET'", // sender address
          to: userEmail, // list of receivers
          subject: 'DIGIWALLET - Activation Email', // Subject line
          html: `<h6>Hi there! </h6><a href='http://localhost:3003/api/v1/auth/verify-user/${result.id}'>Click here</> to activate your account!` // html body
        }

        await transporter.sendMail(mailOptions, function (error, info) {
          if (error) {
            console.log(error)
            return helper.response(res, 400, 'Email Not Send !')
          } else {
            console.log('Email sent: ' + info.response)
            return helper.response(res, 200, 'Activation Email Sent')
          }
        })
        return helper.response(res, 200, 'Success Register User', result)
      } else {
        return helper.response(res, 400, 'Email Already Registered')
      }
    } catch (error) {
      return helper.response(res, 400, 'Bad Request', error)
    }
  },
  login: async (req, res) => {
    try {
      // console.log(req.body)
      const { userEmail, userPassword } = req.body
      const checkUserEmail = await userModel.getDataConditions({
        user_email: userEmail
      })

      if (checkUserEmail.length > 0) {
        if (checkUserEmail[0].user_verification === 0) {
          return helper.response(res, 403, 'Account is not verified')
        }

        const checkPassword = bcrypt.compareSync(
          userPassword,
          checkUserEmail[0].user_password
        )

        if (checkPassword) {
          console.log('User berhasil login')
          const payload = checkUserEmail[0]
          delete payload.user_password
          const token = jwt.sign({ ...payload }, process.env.PRIVATE_KEY, {
            expiresIn: '24h'
          })

          const result = { ...payload, token }
          return helper.response(res, 200, 'Succes Login !', result)
        } else {
          return helper.response(res, 400, 'Wrong password')
        }
      } else {
        return helper.response(res, 404, 'Email not Registered')
      }
    } catch (error) {
      return helper.response(res, 400, 'Bad Request', error)
    }
  },
  getUserById: async (req, res) => {
    try {
      const { id } = req.params
      const result = await userModel.getDataByCondition({ user_id: id })
      const resultBalance = await userModel.getDataBalanceByCondition({
        user_id: id
      })
      const resultTransactionHistory =
        await userModel.getDataTransactionByCondition({
          transaction_sender_id: id
        })
      // USER, BALANCE and TRANSACTION HISTORY available
      if (
        result.length > 0 &&
        resultBalance.length > 0 &&
        resultTransactionHistory.length > 0
      ) {
        const allResults = { result, resultBalance, resultTransactionHistory }
        client.set(`getuserid:${id}`, JSON.stringify(allResults))
        return helper.response(
          res,
          200,
          `Success Get Data By Id ${id}, with User, Balance and Transaction History!`,
          allResults
        )
      }
      // USER and TRANSACTION HISTORY available, but not BALANCE
      if (
        result.length > 0 &&
        resultBalance.length === 0 &&
        resultTransactionHistory.length > 0
      ) {
        const allResults = { result, resultTransactionHistory }
        client.set(`getuserid:${id}`, JSON.stringify(allResults))
        return helper.response(
          res,
          200,
          `Success Get Data By Id ! ${id}, with User and Transaction History but no Balance!`,
          allResults
        )
      }
      // USER and BALANCE available, but not TRANSACTION HISTORY
      if (
        result.length > 0 &&
        resultBalance.length > 0 &&
        resultTransactionHistory.length === 0
      ) {
        const allResults = { result, resultBalance }
        client.set(`getuserid:${id}`, JSON.stringify(allResults))
        return helper.response(
          res,
          200,
          `Success Get Data By Id ! ${id}, with User and Balance but no Transaction History!`,
          allResults
        )
      }
      // USER available, but not BALANCE and TRANSACTION HISTORY
      if (
        result.length > 0 &&
        resultBalance.length === 0 &&
        resultTransactionHistory.length === 0
      ) {
        const allResults = { result }
        client.set(`getuserid:${id}`, JSON.stringify(allResults))
        return helper.response(
          res,
          200,
          `Success Get Data By Id ! ${id}, only User but no Transaction History and Balance!`,
          allResults
        )
      } else {
        return helper.response(res, 200, `Data By Id ${id} Not Found !`, null)
      }
    } catch (error) {
      console.log(error)
      return helper.response(res, 400, 'Bad Request', error)
    }
  },
  updatePin: async (req, res) => {
    try {
      const { id } = req.params
      const { userPin } = req.body
      const salt = bcrypt.genSaltSync(10)
      const encryptPin = bcrypt.hashSync(userPin, salt)
      const setData = {
        user_pin: encryptPin
      }
      console.log(setData)
      const result = await userModel.updateData(setData, id)
      return helper.response(
        res,
        200,
        `Success Update User Pin By Id: ${id}`,
        result
      )
    } catch (error) {
      console.log(error)
      return helper.response(res, 400, 'Bad Request', error)
    }
  },
  updateUser: async (req, res) => {
    try {
      const { id } = req.params
      const { userEmail, userPhone, userName } = req.body
      const setData = {
        user_email: userEmail,
        user_phone: userPhone,
        user_name: userName
      }
      console.log(setData)
      const result = await userModel.updateData(setData, id)
      return helper.response(
        res,
        200,
        `Success Update User Data By Id: ${id}`,
        result
      )
    } catch (error) {
      console.log(error)
      return helper.response(res, 400, 'Bad Request', error)
    }
  },
  deleteUser: async (req, res) => {
    try {
      const { id } = req.params
      const result = await userModel.deleteData(id)
      return helper.response(res, 200, `Success Delete User ${id}`, result)
    } catch (error) {
      return helper.response(res, 400, 'Bad Request', error)
    }
  },
  changeUserVerification: async (req, res) => {
    try {
      let token = req.params.token
      let userId = ''
      let setData = {}
      console.log(`This is the token! ${token}`)
      if (/^\d+$/.test(token)) {
        userId = token
        setData = { user_verification: 1 }
      } else {
        jwt.verify(token, process.env.PRIVATE_KEY, (error, result) => {
          if (
            (error && error.name === 'JsonWebTokenError') ||
            (error && error.name === 'TokenExpiredError')
          ) {
            return helper.response(res, 403, error.message)
          } else {
            // console.log('DECODE token', result)
            token = result
          }
        })
        userId = token.userId
        setData = token.setData
      }

      if (userId && setData) {
        // console.log('Update', setData)
        const result = await userModel.updateData(setData, userId)
        return helper.response(
          res,
          200,
          'succes update data',
          Object.keys(result)
        )
      } else {
        console.log('The Bad Request was from the Email')
        return helper.response(res, 400, 'Bad Request', null)
      }
    } catch (error) {
      console.log('Nope. The Bad Request was from the request itself')
      console.log(error)
      return helper.response(res, 400, 'Bad Request', error)
    }
  }
}
