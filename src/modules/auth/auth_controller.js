const helper = require('../../helpers/wrapper')
const bcrypt = require('bcrypt')
const authModel = require('./auth_model')
require('dotenv').config()
const jwt = require('jsonwebtoken')
const nodemailer = require('nodemailer')

module.exports = {
  getAllUser: async (req, res) => {
    try {
      let { page, limit } = req.query
      page = parseInt(page)
      limit = parseInt(limit)
      const totalData = await authModel.getDataCount()
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
      const result = await authModel.getDataAll(limit, offset)
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
      const totalData = await authModel.getDataCount()
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
      const result = await authModel.getDataAllAscending(limit, offset)
      return helper.response(res, 200, 'Success Get Data', result, pageInfo)
    } catch (error) {
      return helper.response(res, 400, 'Bad Request', error)
    }
  },
  getUsernameSearchKeyword: async (req, res) => {
    try {
      const { keyword } = req.query
      const result = await authModel.getUserSearchKeyword(keyword)
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

      const checkEmailUser = await authModel.getDataByCondition({
        user_email: userEmail
      })

      if (checkEmailUser.length === 0) {
        const result = await authModel.register(setData)
        console.log(result.id)
        delete result.user_password
        const balanceData = {
          user_id: result.id,
          balance: 0
        }
        const resultBalance = await authModel.insertBalance(balanceData)
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
        return helper.response(
          res,
          200,
          'Success Register User',
          result,
          resultBalance
        )
      } else {
        return helper.response(res, 400, 'Email Already Registered')
      }
    } catch (error) {
      console.log(error)
      return helper.response(res, 400, 'Bad Request', error)
    }
  },
  login: async (req, res) => {
    try {
      // console.log(req.body)
      const { userEmail, userPassword } = req.body
      const checkUserEmail = await authModel.getDataConditions({
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
          delete payload.user_pin
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
  updateUser: async (req, res) => {
    try {
      const { id } = req.params
      const { userName, emailName, phoneNumber } = req.body
      const setData = {
        user_name: userName,
        user_email: emailName,
        user_phone: phoneNumber
      }
      const result = await authModel.updateData(setData, id)
      return helper.response(res, 200, 'Success Update User', result)
    } catch (error) {
      return helper.response(res, 400, 'Bad Request', error)
    }
  },
  deleteUser: async (req, res) => {
    try {
      const { id } = req.params
      const result = await authModel.deleteData(id)
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
      if (/^\d+$/.test(token)) {
        userId = token
        setData = { user_verification: 1 }
        console.log(`This is the token! ${userId}`)
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
        const result = await authModel.updateData(setData, userId)
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
