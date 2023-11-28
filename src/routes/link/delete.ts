import { param } from 'express-validator'
import express from 'express'

import { link_model } from '../../models'

import { require_auth, validate_request } from 'common/middlewares'

const router = express.Router()

router.delete(
	'/api/current-user/links/:link_id',
	require_auth(['candidate', 'orderer']),
	param('link_id', 'link_id must be a valid UUID').isUUID(),
	validate_request,
	async (req, res) => {
		const user_id = req.current_user!.user_id
		const { link_id } = req.params

		const [link] = await link_model.delete(link_id, user_id)

		res.status(200).json({ link })
	}
)

export { router as link_delete_router }
