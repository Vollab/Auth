import multer from 'multer'

import { BadRequestError, UploadError } from 'common/errors'

const MAX_SIZE = 2 * 1024 * 1024 // 2Mb

const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, '/app/auth/uploads/')
	},
	filename: function (req, file, cb) {
		cb(null, new Date().valueOf() + '_' + file.originalname)
	}
})

const fileFilter = (req: any, file: any, cb: any) => {
	const allowedMimes = ['image/jpeg', 'image/pjpeg', 'image/png', 'image/gif']

	if (allowedMimes.includes(file.mimetype)) cb(null, true)
	else cb(new BadRequestError('Invalid file type'))
}

export const upload = (req: any, res: any, next: any) => {
	multer({ storage, limits: { fileSize: MAX_SIZE }, fileFilter }).single('avatar')(req, res, err => {
		if (err instanceof multer.MulterError) next(new UploadError(err))
		next(err)
	})
}
