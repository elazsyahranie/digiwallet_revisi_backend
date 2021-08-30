const multer = require('multer')
const helper = require('../helpers/wrapper')
const path = require('path')

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'src/uploads')
  },
  filename: function (req, file, cb) {
    // console.log(file)
    cb(null, new Date().toISOString().replace(/:/g, '-') + file.originalname)
  }
})

const fileFilter = (req, file, callback) => {
  const listExt = ['.jpg', '.png']
  const ext = path.extname(file.originalname).toLowerCase()
  if (listExt.includes(ext)) {
    callback(null, true)
  } else {
    callback(new Error('EXT must be jpg/png !'), false)
  }
}

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 4000 * 4000 }
}).single('image')

const uploadFilter = (req, res, next) => {
  upload(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      return helper.response(res, 401, err.message, null)
    } else if (err) {
      return helper.response(res, 401, err.message, null)
    }
    next()
  })
}

module.exports = uploadFilter
