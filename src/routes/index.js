const express = require('express')
const Route = express.Router()
const userRouter = require('../modules/user/user_routes')
const authRouter = require('../modules/auth/auth_routes')
const forgetRouter = require('../modules/forget/forget_routes')
const balanceRouter = require('../modules/balance/balance_routes')
const activationRouter = require('../modules/auth_activation/auth_activation_routes')
const transactionRouter = require('../modules/transaction/transaction_routes')

// Untuk URL di Postman
Route.use('/user', userRouter)
Route.use('/auth', authRouter)
Route.use('/forget', forgetRouter)
Route.use('/balance', balanceRouter)
Route.use('/activation', activationRouter)
Route.use('/transaction', transactionRouter)
module.exports = Route
