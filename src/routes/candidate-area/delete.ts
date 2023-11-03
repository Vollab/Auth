import { param } from 'express-validator'
import express from 'express'

import { candidate_area_model } from '../../models'
import { candidate_area_deleted_pub } from '../../events/pub'

import { validate_request } from 'common/middlewares'

const router = express.Router()

router.delete(
	'/api/candidates/:candidate_id/activity-area/:activity_area_id',
	param('candidate_id', 'candidate_id must be a valid UUID').isUUID(),
	param('activity_area_id', 'activity_area_id must be a valid UUID').isUUID(),
	validate_request,
	async (req, res) => {
		const { candidate_id, activity_area_id } = req.params

		const [candidate_area] = await candidate_area_model.delete(candidate_id, activity_area_id)

		await candidate_area_deleted_pub.publish({ candidate_id, activity_area_id })

		res.status(200).json({ candidate_area })
	}
)

export { router as candidate_area_delete_router }
