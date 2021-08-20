const express = require('express')
const Route = express.Router()
// const authController = require('./auth_controller')

const {
  getAllUser,
  getAllUsernameAscending,
  getUsernameSearchKeyword,
  register,
  login,
  getUserById,
  changeUserVerification,
  updateUser,
  updatePin,
  deleteUser
} = require('./user_controller')

Route.get('/', getAllUser)
Route.get('/keyword', getUsernameSearchKeyword)
Route.get('/ascend', getAllUsernameAscending)
Route.get('/:id', getUserById)
Route.post('/register', register)
Route.post('/login', login)
Route.get('/verify-user/:token', changeUserVerification)
Route.patch('/:id', updateUser)
Route.patch('/update-pin/:id', updatePin)
Route.delete('/:id', deleteUser)
module.exports = Route
