const express = require('express')
const Route = express.Router()
const uploads = require('../../middleware/uploads')
const { authentication } = require('../../middleware/auth')

const {
  getUserByIdRedis,
  getUserSearchKeywordRedis,
  clearDataUserRedis
} = require('../../middleware/redis')

const {
  getAllUser,
  getAllUsernameAscending,
  getUsernameSearchKeyword,
  getUserById,
  getUserExpense,
  getUserIncome,
  changeUserVerification,
  getUserTransactionListOrderBy,
  updateUser,
  updateUserPassword,
  updateUserImage,
  updatePin,
  deleteUser
} = require('./user_controller')

Route.get('/', getAllUser)
Route.get(
  '/keyword',
  authentication,
  getUserSearchKeywordRedis,
  getUsernameSearchKeyword
)
Route.get('/ascend', authentication, getAllUsernameAscending)
Route.get('/:id', authentication, getUserByIdRedis, getUserById)
Route.get('/user-expense/:id', authentication, getUserExpense)
Route.get('/user-income/:id', authentication, getUserIncome)
Route.get('/verify-user/:token', authentication, changeUserVerification)
Route.get('/for-chart/:id', authentication, getUserTransactionListOrderBy)
Route.patch('/:id', authentication, clearDataUserRedis, updateUser)
Route.patch(
  '/update-password/:id',
  authentication,
  clearDataUserRedis,
  updateUserPassword
)
Route.patch(
  '/update-image/:id',
  authentication,
  clearDataUserRedis,
  uploads,
  updateUserImage
)
Route.patch('/update-pin/:id', authentication, clearDataUserRedis, updatePin)
Route.delete('/:id', authentication, deleteUser)
module.exports = Route
