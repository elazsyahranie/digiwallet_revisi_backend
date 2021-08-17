const helper = require('../../helpers/wrapper')
const transactionModel = require('./transaction_model')
require('dotenv').config()

module.exports = {
  getTransactionById: async (req, res) => {
    try {
      const { id } = req.params
      const result = await transactionModel.getDataById(id)
      if (result.length > 0) {
        return helper.response(
          res,
          200,
          'Success Get Transaction By Id',
          result
        )
      } else {
        return helper.response(res, 200, 'No Transaction With Such ID !', null)
      }
    } catch (error) {
      return helper.response(res, 400, 'Bad Request', error)
    }
  },
  postTransaction: async (req, res) => {
    try {
      const { senderId, receiverId, transactionValue } = req.body
      const setData = {
        transaction_sender_id: senderId,
        transaction_receiver_id: receiverId,
        transaction_amount: transactionValue
      }
      console.log(setData)
      // -- Post to TRANSACTION table --
      const resultPostTransaction = await transactionModel.insertTransaction(
        setData
      )
      // -- Decrease Receiver Balance --
      const resultSender = await transactionModel.getBalanceSender(senderId)
      // console.log(resultSender)
      // console.log(resultSender[0].user_id)
      const { balance } = resultSender[0]
      const userSenderId = resultSender[0].user_id
      const increaseBalance = Number(balance) - Number(transactionValue)
      await transactionModel.updateDataSender(userSenderId, increaseBalance)
      // -- Increase Receiver Balance --
      const resultReceiver = await transactionModel.getBalanceReceiver(
        receiverId
      )
      // console.log(resultReceiver[0])
      const userReceiverId = resultReceiver[0].user_id
      const userReceiverBalance = resultReceiver[0].balance
      const decreaseBalance = userReceiverBalance + Number(transactionValue)
      // console.log(userReceiverId)
      // console.log(decreaseBalance)
      await transactionModel.updateDataReceiver(userReceiverId, decreaseBalance)
      // const balanceSender = Buat model Get Data Balance By Sender Id
      // const updateDataBalanceSender = {
      // Ambil data dari balance
      // } Bikin model untuk update data balance berdasakan sender id
      // Nah disini controller untuk receiver, tambah data berarti. Sama kayak di atas
      return helper.response(
        res,
        200,
        'Transaction Succesful',
        resultPostTransaction,
        resultSender
      )
    } catch (error) {
      return helper.response(res, 400, 'Bad Request', error)
    }
  },
  deleteUser: async (req, res) => {
    try {
      const { id } = req.params
      const result = await transactionModel.deleteData(id)
      return helper.response(res, 200, `Success Delete User ${id}`, result)
    } catch (error) {
      return helper.response(res, 400, 'Bad Request', error)
    }
  }
}
