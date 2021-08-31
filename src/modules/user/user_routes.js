const express = require('express')
const Route = express.Router()
const uploads = require('../../middleware/uploads')
// const authController = require('./auth_controller')

const {
  getUserByIdRedis,
  getUserSearchKeywordRedis,
  clearDataUserRedis
} = require('../../middleware/redis')

const {
  getAllUser,
  getAllUsernameAscending,
  getUsernameSearchKeyword,
  register,
  login,
  getUserById,
  changeUserVerification,
  updateUser,
  updateUserPassword,
  updateUserImage,
  updatePin,
  deleteUser
} = require('./user_controller')

Route.get('/', getAllUser)
Route.get('/keyword', getUserSearchKeywordRedis, getUsernameSearchKeyword)
Route.get('/ascend', getAllUsernameAscending)
Route.get('/:id', getUserByIdRedis, getUserById)
Route.post('/register', clearDataUserRedis, register)
Route.post('/login', login)
Route.get('/verify-user/:token', changeUserVerification)
Route.patch('/:id', clearDataUserRedis, updateUser)
Route.patch('/update-password/:id', clearDataUserRedis, updateUserPassword)
Route.patch('/update-image/:id', clearDataUserRedis, uploads, updateUserImage)
Route.patch('/update-pin/:id', clearDataUserRedis, updatePin)
Route.delete('/:id', deleteUser)
module.exports = Route
