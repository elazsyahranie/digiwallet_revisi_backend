const express = require('express')
const Route = express.Router()
// const authController = require('./auth_controller')

const { forgetPassword } = require('./forget_controller')

Route.patch('/:id', forgetPassword)
module.exports = Route
