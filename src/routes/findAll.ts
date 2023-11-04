import express from 'express'

import { candidate_model, orderer_model } from '../models'

import { require_auth } from 'common/middlewares'

const router = express.Router()

router.get('/api/orderers', require_auth(['candidate', 'orderer']), async (req, res) => {
	const orderers = await orderer_model.findAll()
	orderers.forEach(o => delete (o as any).password)
	res.status(200).json({ orderers })
})

router.get('/api/candidates', require_auth(['candidate', 'orderer']), async (req, res) => {
	const candidates = await candidate_model.findAllWithActivityAreas()
	candidates.forEach(c => delete (c as any).password)
	res.status(200).json({ candidates })
})

export { router as find_all_user_router }
