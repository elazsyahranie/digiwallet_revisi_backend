const express = require('express')
const Route = express.Router()
const { clearDataUserRedis } = require('../../middleware/redis')

const {
  getTransactionById,
  getTransactionAndUser,
  postTransaction
} = require('./transaction_controller')

Route.get('/:id', getTransactionById)
Route.get('/get-transaction/:id', getTransactionAndUser)
Route.post('/insertransaction', clearDataUserRedis, postTransaction)
module.exports = Route
