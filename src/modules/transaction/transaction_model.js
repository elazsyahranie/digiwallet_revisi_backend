const connection = require('../../config/mysql')

module.exports = {
  getDataCount: () => {
    return new Promise((resolve, reject) => {
      connection.query(
        'SELECT COUNT(*) AS total FROM transaction',
        (error, result) => {
          !error ? resolve(result[0].total) : reject(new Error(error))
        }
      )
    })
  },
  getTransactionByCondition: (condition) => {
    return new Promise((resolve, reject) => {
      connection.query(
        'SELECT * FROM transaction WHERE ?',
        condition,
        (error, result) => {
          !error ? resolve(result) : reject(new Error(error))
        }
      )
    })
  },
  getTransactionSenderById: (id, limit) => {
    return new Promise((resolve, reject) => {
      connection.query(
        `SELECT * FROM transaction INNER JOIN user ON transaction.transaction_receiver_id = user.user_id WHERE transaction_sender_id = ${id} LIMIT ${limit}`,
        (error, result) => {
          !error ? resolve(result) : reject(new Error(error))
        }
      )
    })
  },
  getTransactionReceiverById: (id, limit) => {
    return new Promise((resolve, reject) => {
      connection.query(
        `SELECT * FROM transaction INNER JOIN user ON transaction.transaction_sender_id = user.user_id WHERE transaction_receiver_id = ${id} LIMIT ${limit}`,
        (error, result) => {
          !error ? resolve(result) : reject(new Error(error))
        }
      )
    })
  },
  getTransactionByUserId: (id, limit, offset) => {
    return new Promise((resolve, reject) => {
      connection.query(
        `SELECT * FROM transaction WHERE transaction_sender_id = ${id} OR transaction_receiver_id = ${id} LIMIT ${limit} OFFSET ${offset}`,
        (error, result) => {
          console.log(error)
          !error ? resolve(result) : reject(new Error(error))
        }
      )
    })
  },
  getUserDataConditions: (data) => {
    return new Promise((resolve, reject) => {
      connection.query('SELECT * FROM user WHERE ?', data, (error, result) => {
        !error ? resolve(result) : reject(new Error(error))
      })
    })
  },
  insertTransaction: (data) => {
    return new Promise((resolve, reject) => {
      connection.query(
        'INSERT INTO transaction SET ?',
        data,
        (error, result) => {
          console.log(error)
          if (!error) {
            const newResult = {
              id: result.insertId,
              ...data
            }
            resolve(newResult)
          } else {
            reject(new Error(error))
          }
        }
      )
    })
  },
  getBalanceSender: (senderId) => {
    return new Promise((resolve, reject) => {
      connection.query(
        `SELECT * FROM balance WHERE user_id = ${senderId}`,
        (error, result) => {
          console.log(error)
          !error ? resolve(result) : reject(new Error(error))
        }
      )
    })
  },
  updateDataSender: (userSenderId, increaseBalance) => {
    return new Promise((resolve, reject) => {
      connection.query(
        `UPDATE balance SET balance = ${increaseBalance} WHERE user_id = ${userSenderId}`,
        (error, result) => {
          console.log(error)
          if (!error) {
            const newResult = {
              userId: userSenderId,
              ...increaseBalance
            }
            resolve(newResult)
          } else {
            reject(new Error(error))
          }
        }
      )
    })
  },
  getBalanceReceiver: (receiverId) => {
    return new Promise((resolve, reject) => {
      connection.query(
        `SELECT * FROM balance WHERE user_id = ${receiverId}`,
        (error, result) => {
          console.log(error)
          !error ? resolve(result) : reject(new Error(error))
        }
      )
    })
  },
  updateDataReceiver: (userReceiverId, decreaseBalance) => {
    return new Promise((resolve, reject) => {
      connection.query(
        `UPDATE balance SET balance = ${decreaseBalance} WHERE user_id = ${userReceiverId}`,
        (error, result) => {
          console.log(error)
          if (!error) {
            const newResult = {
              userId: userReceiverId,
              ...decreaseBalance
            }
            resolve(newResult)
          } else {
            reject(new Error(error))
          }
        }
      )
    })
  },
  updateData: (setData, id) => {
    return new Promise((resolve, reject) => {
      connection.query(
        'UPDATE user SET ? WHERE user_id = ?',
        [setData, id],
        (error, result) => {
          if (!error) {
            const newResult = {
              id: id,
              ...setData
            }
            resolve(newResult)
          } else {
            reject(new Error(error))
          }
        }
      )
    })
  },
  deleteData: (id) => {
    return new Promise((resolve, reject) => {
      connection.query(
        'DELETE FROM user WHERE user_id = ?',
        id,
        (error, result) => {
          !error ? resolve(result) : reject(new Error(error))
        }
      )
    })
  }
}
