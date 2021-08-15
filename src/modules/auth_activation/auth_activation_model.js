const connection = require('../../config/mysql')

module.exports = {
  activateData: (id) => {
    return new Promise((resolve, reject) => {
      connection.query(
        `UPDATE user SET user_verify = 1 WHERE user_id = ${id}`,
        (error, result) => {
          console.log(result)
          !error ? resolve(result) : reject(new Error(error))
        }
      )
    })
  }
}
