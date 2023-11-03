import { activity_area_model } from 'auth/src/models/actitvity-area'
import express from 'express'

const router = express.Router()

router.get('/api/activity-areas', async (req, res) => {
	const activity_areas = await activity_area_model.findAll()

	return res.status(200).json({ activity_areas })
})

export { router as activity_area_router }
