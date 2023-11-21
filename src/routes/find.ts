import { param } from 'express-validator'
import express from 'express'

import { full_candidate_model, full_orderer_model, user_model } from '../models'

import { require_auth } from 'common/middlewares'
import { NotFoundError } from 'common/errors'

const router = express.Router()

router.get('/api/users', require_auth(['candidate', 'orderer']), async (req, res) => {
	const users = await user_model.findAllWithRole()
	users.forEach(u => delete (u as any).password)
	res.status(200).json({ users })
})

router.get(
	'/api/users/:user_id',
	param('user_id', 'user id must be a valid UUID').isUUID().notEmpty(),
	require_auth(['candidate', 'orderer']),
	async (req, res) => {
		const { user_id } = req.params

		const [user] = await user_model.findByIdWithRole(user_id)
		if (!user) throw new NotFoundError('User not found!')

		delete (user as any).password
		res.status(200).json({ user })
	}
)

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

router.get(
	'/api/candidates/:candidate_id',
	param('candidate_id', 'candidate id must be a valid UUID').isUUID().notEmpty(),
	require_auth(['candidate', 'orderer']),
	async (req, res) => {
		const { candidate_id } = req.params

		const [candidate] = await full_candidate_model.findByIdWithActivityAreas(candidate_id)
		if (!candidate) throw new NotFoundError('Candidate not found!')

		delete (candidate as any).password
		res.status(200).json({ candidate })
	}
)

export { router as find_all_user_router }
