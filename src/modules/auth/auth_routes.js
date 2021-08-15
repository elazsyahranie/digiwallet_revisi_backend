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
  deleteUser
} = require('./auth_controller')

Route.get('/', getAllUser)
Route.get('/keyword', getUsernameSearchKeyword)
Route.get('/ascend', getAllUsernameAscending)
Route.post('/register', register)
Route.post('/login', login)
Route.get('/:id', getUserById)
Route.get('/verify-user/:token', changeUserVerification)
Route.patch('/:id', updateUser)
Route.delete('/:id', deleteUser)
module.exports = Route
