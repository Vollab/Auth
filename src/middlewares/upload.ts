import { BadRequestError, UploadError } from 'common/errors'
import multer from 'multer'
import { storage, MAX_SIZE } from '../storage'

const fileFilter = (req: any, file: any, cb: any) => {
  const allowedMimes = ['image/jpeg', 'image/pjpeg', 'image/png', 'image/gif']

  if (allowedMimes.includes(file.mimetype)) cb(null, true)
  else cb(new BadRequestError('Invalid file type'))
}

export const upload = (req: any, res: any, next: any) => {
  multer({ storage, limits: { fileSize: MAX_SIZE }, fileFilter }).single(
    'avatar'
  )(req, res, err => {
    if (err instanceof multer.MulterError) next(new UploadError(err))
    next(err)
  })
}
