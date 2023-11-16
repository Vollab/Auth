import express from 'express'
import multer from 'multer'
import fs from 'fs'

import { avatar_model } from '../models'

import { require_auth, transaction } from 'common/middlewares'
import { BadRequestError } from 'common/errors'

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
	else cb(new BadRequestError('Invalid file type.'))
}
const upload = multer({ storage, limits: { fileSize: MAX_SIZE }, fileFilter })
const router = express.Router()

router.get('/api/avatar', require_auth(['candidate', 'orderer']), async (req, res) => {
	const user_id = req.current_user!.user_id

	const [{ file_path, mime_type }] = await avatar_model.findById(user_id)

	return res.status(200).setHeader('Content-Type', mime_type).sendFile(file_path)
})

router.put('/api/avatar', require_auth(['candidate', 'orderer']), upload.single('avatar'), transaction, async (req, res) => {
	const user_id = req.current_user!.user_id
	const { filename: file_name, path: file_path, mimetype: mime_type, size } = req.file!

	const [{ file_path: old_file_path }] = await avatar_model.delete(user_id)
	const [avatar] = await avatar_model.insert({ id: user_id, file_name, file_path, mime_type, size })

	if (file_name != 'default_avatar') fs.unlinkSync(old_file_path)

	res.status(200).json({ avatar })
})

export { router as avatar_router }
