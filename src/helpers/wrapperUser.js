require('dotenv').config()

module.exports = {
  response: (
    response,
    status,
    msg,
    resultUser,
    resultBalance,
    resultTransactionHistory,
    pagination
  ) => {
    const result = {}
    result.status = status || 200
    result.msg = msg
    result.resultUser = resultUser
    result.resultBalance = resultBalance
    result.transactionHistory = resultTransactionHistory
    result.pagination = pagination
    return response.status(result.status).json(result)
  }
}
