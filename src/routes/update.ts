import { body, param } from 'express-validator'
import express from 'express'

import { candidate_updated_pub, orderer_updated_pub } from '../events/pub'
import { candidate_model, orderer_model } from '../models'

import { require_auth, validate_request } from 'common/middlewares'

const router = express.Router()

router.patch(
	'/api/orderers',
	require_auth(['orderer']),
	body('name', 'name must be between 5 and 30 characters').isLength({ min: 5, max: 30 }).optional(),
	body('biography').optional(),
	validate_request,
	async (req, res) => {
		const id = req.current_user!.user_id
		const { name, biography } = req.body

		const [orderer] = await orderer_model.update(id, { name, biography })
		delete (orderer as any).password

		await orderer_updated_pub.publish({ id, name, biography })

		res.status(200).json({ orderer })
	}
)

router.patch(
	'/api/candidates',
	require_auth(['candidate']),
	body('name', 'name must be between 5 and 30 characters').isLength({ min: 5, max: 30 }).optional(),
	body('biography').optional(),
	validate_request,
	async (req, res) => {
		const id = req.current_user!.user_id
		const { name, biography } = req.body

		const [candidate] = await candidate_model.update(id, { name, biography })
		delete (candidate as any).password

		await candidate_updated_pub.publish({ id, name, biography })

		res.status(200).json({ candidate })
	}
)

export { router as update_user_router }
