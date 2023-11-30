import multer from 'multer'

export const MAX_SIZE = 2 * 1024 * 1024 // 2Mb

export const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, '/app/auth/uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, new Date().valueOf() + '_' + file.originalname)
  }
})
