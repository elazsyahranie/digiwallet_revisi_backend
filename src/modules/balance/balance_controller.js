const helper = require('../../helpers/wrapper')
const balanceModel = require('./balance_model')
require('dotenv').config()

module.exports = {
  getBalanceById: async (req, res) => {
    try {
      const { id } = req.params
      const result = await balanceModel.getDataById({ balance_id: id })
      if (result.length > 0) {
        return helper.response(res, 200, 'Success Get Balance By Id', result)
      } else {
        return helper.response(res, 200, 'No Balance With Such ID !', null)
      }
    } catch (error) {
      return helper.response(res, 400, 'Bad Request', error)
    }
  },
  getBalanceByUserId: async (req, res) => {
    try {
      const { id } = req.params
      const result = await balanceModel.getDataById({ user_id: id })
      if (result.length > 0) {
        return helper.response(
          res,
          200,
          `Success Get Balance By User Id: ${id}`,
          result
        )
      } else {
        return helper.response(
          res,
          200,
          `No Balance With Such ID ${id} !`,
          null
        )
      }
    } catch (error) {
      return helper.response(res, 400, 'Bad Request', error)
    }
  },
  topUpBalance: async (req, res) => {
    try {
      const { id } = req.params
      const { balanceTopUp } = req.body
      const balanceData = await balanceModel.getDataById({ user_id: id })
      if (balanceData.length > 0) {
        const setData = {
          balance: balanceData[0].balance + parseInt(balanceTopUp)
        }
        console.log(setData)
        const result = await balanceModel.updateBalanceAmount(setData, id)
        return helper.response(res, 200, 'Top Up success!', result)
      } else {
        return helper.response(
          res,
          200,
          `No Balance With Such ID ${id} !`,
          null
        )
      }
    } catch (error) {
      console.log(error)
      return helper.response(res, 400, 'Bad Request', error)
    }
  },
  updateBalance: async (req, res) => {
    try {
      const { id } = req.params
      const { transactionSenderId, transactionReceiverId, transactionValue } =
        req.body
      const setData = {
        transaction_sender_id: transactionSenderId,
        transaction_receiver_id: transactionReceiverId,
        transaction_value: transactionValue
      }
      const result = await balanceModel.updateData(setData, id)
      return helper.response(res, 200, 'Success Update User', result)
    } catch (error) {
      return helper.response(res, 400, 'Bad Request', error)
    }
  },
  deleteUser: async (req, res) => {
    try {
      const { id } = req.params
      const result = await balanceModel.deleteData(id)
      return helper.response(res, 200, `Success Delete User ${id}`, result)
    } catch (error) {
      return helper.response(res, 400, 'Bad Request', error)
    }
  }
}
