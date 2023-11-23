import { body } from 'express-validator'
import express from 'express'

import { link_model } from '../../models'

import { require_auth, validate_request } from 'common/middlewares'

const router = express.Router()

router.post(
  '/api/users/links',
  require_auth(['candidate', 'orderer']),
  body('url', 'url must not be empty').notEmpty(),
  body('text', 'text must not be empty').notEmpty(),
  validate_request,
  async (req, res) => {
    const user_id = req.current_user!.user_id
    const { url, text } = req.body

    const [link] = await link_model.insert({ user_id, url, text })

    res.status(201).json({ link })
  }
)

export { router as link_create_router }
