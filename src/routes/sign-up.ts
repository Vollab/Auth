import { body } from 'express-validator'
import express from 'express'

import { candidate_created_pub, orderer_created_pub } from '../events/pub'
import { candidate_model, orderer_model, user_model } from '../models'
import { Password, Session } from '../services'

import { validate_request } from 'common/middlewares'

const isEmailNotInUse = async (value: string) => {
	const [has_user] = await user_model.findByEmail(value)
	if (has_user) throw new Error('E-mail already in use')
}

const isPhoneNotInUse = async (value: string) => {
	const [has_user] = await user_model.findByPhone(value)
	if (has_user) throw new Error('Phone already in use')
}

const router = express.Router()

router.post(
	'/api/orderers/sign-up',
	body('email', 'Email must be valid').isEmail().custom(isEmailNotInUse),
	body('name', 'Name must be between 5 and 30 characters').isLength({ min: 5, max: 30 }),
	body('phone', 'Phone must match the pattern: (xx) xxxxx-xxxx')
		.matches(/^\([1-9]{2}\) (?:[2-8]|9\d)\d{3}\-\d{4}$/)
		.custom(isPhoneNotInUse),
	body('biography', 'biography must not be empty').notEmpty(),
	body('password', 'Password not strong enough').isStrongPassword(),
	validate_request,
	async (req, res) => {
		const { name, email, biography, phone, password } = req.body

		const hash = await Password.to_hash(password)

		const [user] = await user_model.insert({ name, email, biography, phone, password: hash })
		const [orderer] = await orderer_model.insert({ id: user.id })

		const full_orderer = { ...user, ...orderer }
		const { id, created_at, updated_at } = full_orderer
		delete (full_orderer as any).password

		await orderer_created_pub.publish({ id, email, name, created_at, updated_at })

		await Session.create(res, user.id, 'orderer')
		res.status(201).json({ orderer: full_orderer })
	}
)

router.post(
	'/api/candidates/sign-up',
	body('email', 'Email must be valid').isEmail().custom(isEmailNotInUse),
	body('name', 'Name must be between 5 and 30 characters').isLength({ min: 5, max: 30 }),
	body('phone', 'Phone must match the pattern: (xx) xxxxx-xxxx')
		.matches(/^\([1-9]{2}\) (?:[2-8]|9\d)\d{3}\-\d{4}$/)
		.custom(isPhoneNotInUse),
	body('biography', 'biography must not be empty').notEmpty(),
	body('password', 'Password not strong enough').isStrongPassword(),
	validate_request,
	async (req, res) => {
		const { name, email, biography, phone, password } = req.body

		const hash = await Password.to_hash(password)

		const [user] = await user_model.insert({ name, email, biography, phone, password: hash })
		const [candidate] = await candidate_model.insert({ id: user.id })

		const full_candidate = { ...user, ...candidate }
		const { id, created_at, updated_at } = full_candidate
		delete (full_candidate as any).password

		await candidate_created_pub.publish({ id, email, name, created_at, updated_at })

		await Session.create(res, user.id, 'candidate')
		res.status(201).json({ candidate: full_candidate })
	}
)

export { router as sign_up_router }
