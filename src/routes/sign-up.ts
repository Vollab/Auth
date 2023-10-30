import { body } from 'express-validator'
import express from 'express'

import { candidate_created_pub, orderer_created_pub } from '../events/pub'
import { candidate_model, orderer_model, user_model } from '../models'

import { validate_request } from 'common/middlewares'
import { BadRequestError } from 'common/errors'
import { Password } from 'auth/src/services'

const router = express.Router()

router.post(
	'/api/orderers/sign-up',
	body('email', 'Email must be valid').isEmail(),
	body('name', 'Name must be between 5 and 30 characters').isLength({ min: 5, max: 30 }),
	body('phone', 'Phone must match the pattern').matches(/^\([1-9]{2}\) (?:[2-8]|9[0-9])[0-9]{3}\-[0-9]{4}$/),
	body('biography', 'biography must not be empty').notEmpty(),
	body('password', 'Password must be between 5 and 20 characters').trim().isLength({ min: 4, max: 20 }),
	validate_request,
	async (req, res) => {
		const { name, email, biography, phone, password } = req.body

		const [has_user] = await user_model.findByEmail(email)
		if (has_user) throw new BadRequestError('Email in use')

		const hash = await Password.to_hash(password)

		const [orderer] = await orderer_model.insert({ name, email, biography, phone, password: hash })

		await orderer_created_pub.publish({ id: orderer.id, email, name })

		res.status(201).json({ orderer })
	}
)

router.post(
	'/api/candidates/sign-up',
	body('email', 'Email must be valid').isEmail(),
	body('name', 'Name must be between 5 and 30 characters').isLength({ min: 5, max: 30 }),
	body('phone', 'Phone must match the pattern').matches(/^\([1-9]{2}\) (?:[2-8]|9[0-9])[0-9]{3}\-[0-9]{4}$/),
	body('biography', 'biography must not be empty').notEmpty(),
	body('password', 'Password must be between 5 and 20 characters').trim().isLength({ min: 4, max: 20 }),
	validate_request,
	async (req, res) => {
		const { name, email, biography, phone, password } = req.body

		const [has_user] = await user_model.findByEmail(email)
		if (has_user) throw new BadRequestError('Email in use')

		const hash = await Password.to_hash(password)

		const [candidate] = await candidate_model.insert({ name, email, biography, phone, password: hash })

		await candidate_created_pub.publish({ id: candidate.id, email, name })

		res.status(201).json({ candidate })
	}
)

export { router as sign_up_router }
