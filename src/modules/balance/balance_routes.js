const express = require('express')
const Route = express.Router()

const { clearDataUserRedis } = require('../../middleware/redis')

const {
  getBalanceById,
  getBalanceByUserId,
  updateBalance,
  topUpBalance
} = require('./balance_controller')

Route.get('/:id', getBalanceById)
Route.get('/userBalance', getBalanceByUserId)
Route.patch('/:id', updateBalance)
Route.patch('/top-up/:id', clearDataUserRedis, topUpBalance)
module.exports = Route
