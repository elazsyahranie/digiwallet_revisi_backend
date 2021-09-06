/* eslint-disable no-unneeded-ternary */
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
      let { page, limit, sort, search } = req.query
      page = page ? parseInt(page) : 1
      limit = limit ? parseInt(limit) : 5
      sort = sort ? sort : 'user_id ASC'
      search = search ? search : ''
      const totalData = await userModel.getDataCount()
      // console.log('Total Data: ' + totalData)
      const totalPage = Math.ceil(totalData / limit)
      // console.log('Total Page: ' + totalPage)
      const offset = page * limit - limit
      // console.log('offset' + offset)
      const pageInfo = {
        page,
        totalPage,
        limit,
        totalData
      }
      const result = await userModel.getDataAll(limit, offset, sort, search)
      console.log(result.length)
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
      let { page, limit, sort } = req.query

      page = page ? parseInt(page) : 1
      limit = limit ? parseInt(limit) : 5
      sort = sort ? sort : 'user_name ASC'

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
      const result = await userModel.getUserSearchKeyword(
        keyword,
        limit,
        offset,
        sort
      )
      return helper.response(
        res,
        200,
        'Success Find Username By Keyword',
        result,
        pageInfo
      )
    } catch (error) {
      console.log(error)
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
          return helper.response(res, 400, 'Password incorrect')
        }
      } else {
        return helper.response(res, 404, 'Email not registered')
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
        const allResults = {
          result: result,
          resultBalance: { balance: 0 },
          resultTransactionHistory: resultTransactionHistory
        }
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
        const allResults = { result, resultBalance, resultTransactionHistory }
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
        const allResults = {
          result: result,
          resultBalance: [{ balance: 0 }],
          resultTransactionHistory: resultTransactionHistory
        }
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
  getUserExpense: async (req, res) => {
    try {
      const { id } = req.params
      const result = await userModel.getDataTransactionByCondition({
        transaction_sender_id: id
      })
      if (result.length > 0) {
        const mappedResult = result.map((a) => a.transaction_amount)
        let sum = 0
        for (let i = 0; i < mappedResult.length; i++) {
          sum += mappedResult[i]
        }
        return helper.response(
          res,
          200,
          `Success get expense data by id - ${id}`,
          sum
        )
      } else {
        return helper.response(res, 200, `Data By Id ${id} Not Found !`, null)
      }
    } catch (error) {
      console.log(error)
      return helper.response(res, 400, 'Bad Request', error)
    }
  },
  getUserIncome: async (req, res) => {
    try {
      const { id } = req.params
      const result = await userModel.getDataTransactionByCondition({
        transaction_receiver_id: id
      })
      if (result.length > 0) {
        const mappedResult = result.map((a) => a.transaction_amount)
        let sum = 0
        for (let i = 0; i < mappedResult.length; i++) {
          sum += mappedResult[i]
        }
        return helper.response(
          res,
          200,
          `Success get income data by id - ${id}`,
          sum
        )
      } else {
        return helper.response(res, 200, `Data By Id ${id} Not Found !`, null)
      }
    } catch (error) {
      console.log(error)
      return helper.response(res, 400, 'Bad Request', error)
    }
  },
  getUserTransactionListOrderBy: async (req, res) => {
    try {
      const { id } = req.params
      const result = await userModel.getUserTransactionList(id)
      if (result.length > 0) {
        return helper.response(
          res,
          200,
          `Success get data for chart by id - ${id}`,
          result
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
  updateUserPassword: async (req, res) => {
    try {
      const { id } = req.params
      const { userPassword, userNewPassword } = req.body
      const checkUser = await userModel.getDataConditions({
        user_id: id
      })

      if (checkUser.length > 0) {
        if (checkUser[0].user_verification === 0) {
          return helper.response(res, 403, 'Account is not verified')
        }

        const checkPassword = bcrypt.compareSync(
          userPassword,
          checkUser[0].user_password
        )

        if (checkPassword) {
          const salt = bcrypt.genSaltSync(10)
          const encryptPassword = bcrypt.hashSync(userNewPassword, salt)
          const setData = {
            user_password: encryptPassword
          }
          const result = await userModel.updateData(setData, id)
          return helper.response(
            res,
            200,
            `Change password success! User ID - ${id}`,
            result
          )
        } else {
          return helper.response(res, 400, 'Wrong password')
        }
      }
    } catch (error) {
      console.log(error)
      return helper.response(res, 400, 'Bad Request', error)
    }
  },
  updateUserImage: async (req, res) => {
    try {
      const { id } = req.params

      const checkUserData = await userModel.getDataByCondition({
        user_id: id
      })

      const setData = {
        user_image: req.file ? req.file.filename : '',
        user_updated_at: new Date(Date.now())
      }

      console.log(setData)
      if (checkUserData.length > 0) {
        const result = await userModel.updateUserImage(setData, { user_id: id })
        return helper.response(
          res,
          200,
          `Success Update User Image By Id: ${id}`,
          result
        )
      } else {
        return helper.response(
          res,
          404,
          `User Data By Id ${id} Not Found`,
          null
        )
      }
    } catch (error) {
      console.log(error)
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
  },
  deleteUser: async (req, res) => {
    try {
      const { id } = req.params
      const result = await userModel.deleteData(id)
      return helper.response(res, 200, `Success Delete User ${id}`, result)
    } catch (error) {
      return helper.response(res, 400, 'Bad Request', error)
    }
  }
}
