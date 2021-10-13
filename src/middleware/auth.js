const helper = require('../helpers/wrapper')
const jwt = require('jsonwebtoken')

module.exports = {
  authentication: (req, res, next) => {
    let token = req.headers.authorization
    if (token) {
      token = token.split(' ')[1]
      jwt.verify(token, process.env.PRIVATE_KEY, (error, result) => {
        if (
          (error && error.name === 'JsonWebTokenError') ||
          (error && error.name === 'TokenExpiredError')
        ) {
          return helper.response(res, 403, error.message)
        } else {
          req.decodeToken = result
          if (req.decodeToken.user_verification === 0) {
            console.log(req.decodeToken.user_verification)
            return helper.response(res, 403, 'Please verify your email first !')
          }
          next()
        }
      })
    } else {
      return helper.response(res, 403, 'Please login first !')
    }
  },
  isAdmin: (req, res, next) => {
    console.log('Middleware isAdmin running !')
    console.log(req.decodeToken)
    if (req.decodeToken.user_role === 'Admin') {
      next()
    } else {
      return helper.response(res, 403, 'sorry you are not admin !')
    }
  }
}
