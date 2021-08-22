const helper = require('../../helpers/wrapper')
const transactionModel = require('./transaction_model')
const bcrypt = require('bcrypt')
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
      const { senderId, senderPin, receiverId, transactionValue } = req.body
      const checkSenderAccount = await transactionModel.getUserDataConditions({
        user_id: senderId
      })
      if (checkSenderAccount.length > 0) {
        const checkPin = bcrypt.compareSync(
          senderPin,
          checkSenderAccount[0].user_pin
        )
        if (checkPin) {
          const setData = {
            transaction_sender_id: senderId,
            transaction_receiver_id: receiverId,
            transaction_amount: transactionValue
          }
          const resultPostTransaction =
            await transactionModel.insertTransaction(setData)
          // -- Decrease Receiver Balance --
          const resultSender = await transactionModel.getBalanceSender(senderId)
          const { balance } = resultSender[0]
          const userSenderId = resultSender[0].user_id
          const increaseBalance = Number(balance) - Number(transactionValue)
          await transactionModel.updateDataSender(userSenderId, increaseBalance)
          // -- Increase Receiver Balance --
          const resultReceiver = await transactionModel.getBalanceReceiver(
            receiverId
          )
          const userReceiverId = resultReceiver[0].user_id
          const userReceiverBalance = resultReceiver[0].balance
          const decreaseBalance = userReceiverBalance + Number(transactionValue)
          await transactionModel.updateDataReceiver(
            userReceiverId,
            decreaseBalance
          )
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
        } else {
          console.log("There's mistake in the PIN code you've entered!")
        }
      } else {
        console.log(`Data by Id: ${senderId} not found!`)
      }
    } catch (error) {
      console.log(error)
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
