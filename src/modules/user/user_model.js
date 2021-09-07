const connection = require('../../config/mysql')

module.exports = {
  getDataAll: (limit, offset, sort, search) => {
    return new Promise((resolve, reject) => {
      connection.query(
        `SELECT * FROM user WHERE user_name LIKE '%${search}%' ORDER BY ${sort} LIMIT ? OFFSET ?`,
        [limit, offset],
        (error, result) => {
          !error ? resolve(result) : reject(new Error(error))
        }
      )
    })
  },
  getDataAllAscending: (limit, offset) => {
    return new Promise((resolve, reject) => {
      connection.query(
        'SELECT * FROM user WHERE user_name LIMIT ? OFFSET ?',
        [limit, offset],
        (error, result) => {
          !error ? resolve(result) : reject(new Error(error))
        }
      )
    })
  },
  getDataCount: () => {
    return new Promise((resolve, reject) => {
      connection.query(
        'SELECT COUNT(*) AS total FROM user',
        (error, result) => {
          !error ? resolve(result[0].total) : reject(new Error(error))
        }
      )
    })
  },
  getUserSearchKeyword: (keyword, limit, offset) => {
    return new Promise((resolve, reject) => {
      connection.query(
        `SELECT * FROM user WHERE user_name LIKE '%${keyword}%' LIMIT ? OFFSET ?`,
        [limit, offset],
        (error, result) => {
          console.log(result)
          !error ? resolve(result) : reject(new Error(error))
        }
      )
    })
  },
  register: (data) => {
    return new Promise((resolve, reject) => {
      connection.query('INSERT INTO user SET ?', data, (error, result) => {
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
      })
    })
  },
  getDataConditions: (data) => {
    return new Promise((resolve, reject) => {
      connection.query('SELECT * FROM user WHERE ?', data, (error, result) => {
        !error ? resolve(result) : reject(new Error(error))
      })
    })
  },
  getDataByCondition: (condition) => {
    return new Promise((resolve, reject) => {
      connection.query(
        'SELECT * FROM user WHERE ?',
        condition,
        (error, result) => {
          !error ? resolve(result) : reject(new Error(error))
        }
      )
    })
  },
  getDataBalanceByCondition: (condition) => {
    return new Promise((resolve, reject) => {
      connection.query(
        'SELECT * FROM balance WHERE ?',
        condition,
        (error, result) => {
          !error ? resolve(result) : reject(new Error(error))
        }
      )
    })
  },
  getDataTransactionByCondition: (condition) => {
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
  getUserTransactionList: (id) => {
    return new Promise((resolve, reject) => {
      connection.query(
        `SELECT DATE(transaction_created_at) AS DATE, SUM(transaction_amount) AS totalAmount FROM transaction WHERE transaction_sender_id = ${id} AND WEEK(transaction_created_at) = WEEK(NOW()) GROUP BY DATE(transaction_created_at);`,
        (error, result) => {
          !error ? resolve(result) : reject(new Error(error))
        }
      )
    })
  },
  getDataById: (id) => {
    return new Promise((resolve, reject) => {
      connection.query(
        `SELECT * FROM user WHERE user_id = ${id}`,
        (error, result) => {
          console.log(error)
          !error ? resolve(result) : reject(new Error(error))
        }
      )
    })
  },
  updateData: (setData, id) => {
    return new Promise((resolve, reject) => {
      connection.query(
        `UPDATE user SET ? WHERE user_id = ${id}`,
        setData,
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
  updateUserImage: (setData, id) => {
    return new Promise((resolve, reject) => {
      connection.query(
        'UPDATE user SET ? WHERE ?',
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
  updateUserPassword: (setData, id) => {
    return new Promise((resolve, reject) => {
      connection.query(
        'UPDATE user SET ? WHERE user_id = ?',
        [setData, id],
        (error, result) => {
          if (!error) {
            const newResult = {
              id: result.insertId,
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
