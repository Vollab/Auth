import { param } from 'express-validator'
import express from 'express'

import { candidate_area_model } from '../../models'
import { candidate_area_created_pub } from '../../events/pub'

import { require_auth, validate_request } from 'common/middlewares'

const router = express.Router()

router.post(
	'/api/candidates/activity-area/:activity_area_id',
	require_auth(['candidate']),
	param('activity_area_id', 'activity_area_id must be a valid UUID').isUUID(),
	validate_request,
	async (req, res) => {
		const candidate_id = req.current_user!.user_id
		const { activity_area_id } = req.params

		const [candidate_area] = await candidate_area_model.insert({ candidate_id, activity_area_id })

		await candidate_area_created_pub.publish({ candidate_id, activity_area_id })

		res.status(201).json({ candidate_area })
	}
)

export { router as candidate_area_create_router }
