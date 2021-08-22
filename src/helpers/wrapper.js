require('dotenv').config()

module.exports = {
  response: (response, status, msg, data, data2, data3, pagination) => {
    const result = {}
    result.status = status || 200
    result.msg = msg
    result.data = data
    result.data2 = data2
    result.data3 = data3
    result.pagination = pagination
    return response.status(result.status).json(result)
  }
}
