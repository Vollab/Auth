import express from 'express'

import { full_candidate_model, full_orderer_model } from '../models'

import { require_auth } from 'common/middlewares'

const router = express.Router()

router.get('/api/orderers', require_auth(['candidate', 'orderer']), async (req, res) => {
	const orderers = await full_orderer_model.findAll()
	orderers.forEach(o => delete (o as any).password)
	res.status(200).json({ orderers })
})

router.get('/api/candidates', require_auth(['candidate', 'orderer']), async (req, res) => {
	const candidates = await full_candidate_model.findAllWithActivityAreas()
	candidates.forEach(c => delete (c as any).password)
	res.status(200).json({ candidates })
})

export { router as find_all_user_router }
