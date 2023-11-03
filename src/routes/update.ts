import { body, param } from 'express-validator'
import express from 'express'

import { candidate_updated_pub, orderer_updated_pub } from '../events/pub'
import { candidate_model, orderer_model } from '../models'

import { validate_request } from 'common/middlewares'

const router = express.Router()

router.patch(
	'/api/orderers/:id',
	param('id', 'Id must be a valid UUID').isUUID(),
	body('name', 'Name must be between 5 and 30 characters').isLength({ min: 5, max: 30 }).optional(),
	body('biography').optional(),
	validate_request,
	async (req, res) => {
		const { name, biography } = req.body
		const { id } = req.params

		const [orderer] = await orderer_model.update(id, { name, biography })

		await orderer_updated_pub.publish({ id, name, biography })

		res.status(200).json({ orderer })
	}
)

router.patch(
	'/api/candidates/:id',
	param('id', 'Id must be a valid UUID').isUUID(),
	body('name', 'Name must be between 5 and 30 characters').isLength({ min: 5, max: 30 }).optional(),
	body('biography', 'biography must not be empty').optional(),
	validate_request,
	async (req, res) => {
		const { name, biography } = req.body
		const { id } = req.params

		const [candidate] = await candidate_model.update(id, { name, biography })

		await candidate_updated_pub.publish({ id, name, biography })

		res.status(200).json({ candidate })
	}
)

export { router as update_user_router }
