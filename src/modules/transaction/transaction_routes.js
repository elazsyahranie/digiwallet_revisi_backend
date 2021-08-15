const express = require('express')
const Route = express.Router()
// const trabsactionController = require('./transaction_controller')

const {
  getTransactionById,
  postTransaction
} = require('./transaction_controller')

Route.get('/:id', getTransactionById)
Route.post('/insertransaction', postTransaction)
module.exports = Route
