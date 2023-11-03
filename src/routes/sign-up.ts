import { body } from 'express-validator'
import express from 'express'

import { candidate_model, orderer_model, user_model, candidate_area_model } from '../models'
import { candidate_created_pub, orderer_created_pub } from '../events/pub'
import { Password } from '../services'

import { transaction, validate_request } from 'common/middlewares'

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

		const [orderer] = await orderer_model.insert({ name, email, biography, phone, password: hash })

		await orderer_created_pub.publish({ id: orderer.id, email, name })

		res.status(201).json({ orderer })
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
	// body('area_ids', 'area_ids must be an array with at least one id').isArray({ min: 1 }),
	// body('area_ids.*', 'id of area must be an uuid').isUUID().notEmpty(),
	body('password', 'Password not strong enough').isStrongPassword(),
	validate_request,
	// transaction,
	async (req, res) => {
		const { name, email, biography, phone, area_ids, password } = req.body

		const hash = await Password.to_hash(password)

		const [candidate] = await candidate_model.insert({ name, email, biography, phone, password: hash })

		// const candidate_areas = area_ids.map((area_id: string) => ({ candidate_id: candidate.id, activity_area_id: area_id }))

		// await candidate_area_model.insert(candidate_areas)

		await candidate_created_pub.publish({ id: candidate.id, email, name })

		res.status(201).json({ candidate })
	}
)

export { router as sign_up_router }
