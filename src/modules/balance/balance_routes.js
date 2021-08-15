const express = require('express')
const Route = express.Router()
// const authController = require('./auth_controller')

const { getBalanceById, updateBalance } = require('./balance_controller')

Route.get('/:id', getBalanceById)
Route.patch('/:id', updateBalance)
module.exports = Route
