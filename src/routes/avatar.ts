import express from 'express'
import fs from 'fs'
import { upload } from '../middlewares/upload'
import { avatar_model } from '../models'

import { require_auth, transaction } from 'common/middlewares'
import { param } from 'express-validator'
import { toBase64 } from '../utils/toBase64'

const router = express.Router()

router.get(
  '/api/current-user/avatar',
  require_auth(['candidate', 'orderer']),
  async (req, res) => {
    const user_id = req.current_user!.user_id

    const [{ file_path, mime_type }] = await avatar_model.findById(user_id)

    return res.status(200).json({ avatar: toBase64({ file_path, mime_type }) })
  }
)

router.get(
  '/api/users/:user_id/avatar',
  param('user_id', 'user id must be a valid UUID').isUUID().notEmpty(),
  require_auth(['candidate', 'orderer']),
  async (req, res) => {
    const { user_id } = req.params

    const [{ file_path, mime_type }] = await avatar_model.findById(user_id)

    return res.status(200).json({ avatar: toBase64({ file_path, mime_type }) })
  }
)

router.put(
  '/api/current-user/avatar',
  require_auth(['candidate', 'orderer']),
  upload,
  transaction,
  async (req, res) => {
    const user_id = req.current_user!.user_id
    const {
      filename: file_name,
      path: file_path,
      mimetype: mime_type,
      size
    } = req.file!

    const [old_avatar] = await avatar_model.delete(user_id)
    const [avatar] = await avatar_model.insert({
      id: user_id,
      file_name,
      file_path,
      mime_type,
      size
    })

    if (old_avatar.file_name != 'default_avatar')
      fs.unlinkSync(old_avatar.file_path)

    res.status(200).json({ avatar })
  }
)

export { router as avatar_router }
