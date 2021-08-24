const express = require('express')
const Route = express.Router()
const { clearDataUserRedis } = require('../../middleware/redis')

const {
  getTransactionById,
  postTransaction
} = require('./transaction_controller')

Route.get('/:id', getTransactionById)
Route.post('/insertransaction', clearDataUserRedis, postTransaction)
module.exports = Route
