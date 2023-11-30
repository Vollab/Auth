import { param } from 'express-validator'
import express from 'express'

import { candidate_area_model } from '../../models'

import { require_auth, validate_request } from 'common/middlewares'

const router = express.Router()

router.delete(
	'/api/candidates/activity-area/:activity_area_id',
	require_auth(['candidate']),
	param('activity_area_id', 'activity_area_id must be a valid UUID').isUUID(),
	validate_request,
	async (req, res) => {
		const candidate_id = req.current_user!.user_id
		const { activity_area_id } = req.params

		const [candidate_area] = await candidate_area_model.delete(candidate_id, activity_area_id)

		res.status(200).json({ candidate_area })
	}
)

export { router as candidate_area_delete_router }
