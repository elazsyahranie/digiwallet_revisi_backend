const redis = require('redis')
const client = redis.createClient()
const helper = require('../helpers/wrapper')

module.exports = {
  getUserByIdRedis: (req, res, next) => {
    const { id } = req.params
    if (id) {
      client.get(`getuserid:${id}`, (error, result) => {
        if (!error && result != null) {
          console.log('data ada di dalam redis')
          return helper.response(
            res,
            200,
            `Succes Get User by Id ${id} (Redis)`,
            JSON.parse(result)
          )
        } else {
          console.log('data tidak ada dalam redis')
          next()
        }
      })
    }
  },
  getBalanceByConditionRedis: (req, res, next) => {
    const { id } = req.params
    if (id) {
      client.get(`getbalanceuserid:${id}`, (error, result) => {
        if (!error && result != null) {
          console.log('data ada di dalam redis')
          return helper.response(
            res,
            200,
            `Succes Get Balance by User Id ${id} (Redis)`,
            JSON.parse(result)
          )
        } else {
          console.log('data tidak ada dalam redis')
          next()
        }
      })
    }
  },
  getTransactionByConditionRedis: (req, res, next) => {
    const { id } = req.params
    if (id) {
      client.get(`gettransactionuserid:${id}`, (error, result) => {
        if (!error && result != null) {
          console.log('data ada di dalam redis')
          return helper.response(
            res,
            200,
            `Succes Get Transaction Data by User Id ${id} (Redis)`,
            JSON.parse(result)
          )
        } else {
          console.log('data tidak ada dalam redis')
          next()
        }
      })
    }
  },
  clearDataUserRedis: (req, res, next) => {
    client.keys('getdata*', (_error, result) => {
      console.log('isi key dalam redis', result)
      if (result.length > 0) {
        result.forEach((item) => {
          client.del(item)
        })
      }
      next()
    })
  }
}
