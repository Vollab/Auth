import { body } from 'express-validator'
import express from 'express'

import { Password, Session } from '../services'
import { user_model } from '../models'

import { validate_request } from 'common/middlewares'
import { BadRequestError } from 'common/errors'

const router = express.Router()

router.post(
	'/api/sign-in',
	body('email', 'Email must be valid').isEmail(),
	body('password', 'You must supply a password').trim().notEmpty(),
	validate_request,
	async (req, res) => {
		const { email, password } = req.body

		const [user] = await user_model.findByEmailWithRole(email)

		if (!user || !(await Password.compare(user.password, password))) throw new BadRequestError('Invalid credentials')
		delete (user as any).password

		await Session.create(res, user.id, user.role)
		res.status(200).json({ user })
	}
)

export { router as sign_in_router }
