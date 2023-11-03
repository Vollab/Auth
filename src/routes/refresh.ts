import express from 'express'

import { Session } from '../services'

const router = express.Router()

router.post('/api/refresh', async (req, res) => {
	await Session.refresh(req, res)

	res.status(200).json()
})

export { router as refresh_router }
