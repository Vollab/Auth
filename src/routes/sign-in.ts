import { body } from 'express-validator'
import express from 'express'

import { full_candidate_model, full_orderer_model } from '../models'
import { Password, Session } from '../services'

import { validate_request } from 'common/middlewares'
import { BadRequestError } from 'common/errors'

const router = express.Router()

router.post(
	'/api/orderers/sign-in',
	body('email', 'Email must be valid').isEmail(),
	body('password', 'You must supply a password').trim().notEmpty(),
	validate_request,
	async (req, res) => {
		const { email, password } = req.body

		const [orderer] = await full_orderer_model.findByEmail(email)

		if (!orderer || !(await Password.compare(orderer.password, password))) throw new BadRequestError('Invalid credentials')
		delete (orderer as any).password

		await Session.create(res, orderer.id, 'orderer')
		res.status(200).json({ orderer })
	}
)

router.post(
	'/api/candidates/sign-in',
	body('email', 'Email must be valid').isEmail(),
	body('password', 'You must supply a password').trim().notEmpty(),
	validate_request,
	async (req, res) => {
		const { email, password } = req.body

		const [candidate] = await full_candidate_model.findByEmail(email)

		if (!candidate || !(await Password.compare(candidate.password, password))) throw new BadRequestError('Invalid credentials')
		delete (candidate as any).password

		await Session.create(res, candidate.id, 'candidate')
		res.status(200).json({ candidate })
	}
)

export { router as sign_in_router }
