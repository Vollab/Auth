import { Request, Response } from 'express'
import { v4 as uuidv4 } from 'uuid'
import jwt from 'jsonwebtoken'

import { AccessTokenPayload, RefreshTokenPayload, UserType } from 'common/types/session-payload'
import { BadRequestError } from 'common/errors'
import { logger, redis } from 'common/services'

export class Session {
	private static access_cookie_name = 'session_access'
	private static refresh_cookie_name = 'session_refresh'
	private static redis_subject_name = 'session'

	private constructor() {}

	static async create(res: Response, user_id: string, user_type: UserType) {
		const session_id = uuidv4()

		await redis.client.set(`${this.redis_subject_name}:${user_type}:${user_id}:${session_id}`, 1)

		this.createRefreshToken(res, { user_id, user_type, session_id, session_number: 1 })
		this.createAccessToken(res, { user_id, user_type })
	}

	static async refresh(req: Request, res: Response) {
		if (!req.cookies.session_refresh) throw new BadRequestError('Refresh token not provided')

		const { user_id, user_type, session_id, session_number } = jwt.decode(req.cookies.session_refresh) as RefreshTokenPayload

		const last_session_number = await redis.client.get(`${this.redis_subject_name}:${user_type}:${user_id}:${session_id}`)
		if (!last_session_number) throw new BadRequestError('Session not found')

		const is_last_token = parseInt(last_session_number) === session_number
		if (!is_last_token) {
			const keys = await redis.client.keys(`${this.redis_subject_name}:${user_id}:*`)
			await redis.client.unlink(keys)
			throw new BadRequestError('Suspect access')
		}

		await redis.client.incr(`${this.redis_subject_name}:${user_id}:${session_id}`)

		this.createRefreshToken(res, { user_id, user_type, session_id, session_number: session_number + 1 })
		this.createAccessToken(res, { user_id, user_type })
	}

	static destroy(res: Response) {
		res.clearCookie(this.access_cookie_name)
		res.clearCookie(this.refresh_cookie_name)
	}

	private static createAccessToken(res: Response, payload: AccessTokenPayload) {
		logger.debug('Creating new access token')

		delete payload.exp
		delete payload.iat
		const token = jwt.sign(payload, process.env.JWT_KEY!, { expiresIn: process.env.JWT_ACCESS_TTL! })

		this.setCookie(res, this.access_cookie_name, token)
	}

	private static createRefreshToken(res: Response, payload: RefreshTokenPayload) {
		logger.debug('Creating new refresh token')

		delete payload.exp
		delete payload.iat
		const token = jwt.sign(payload, process.env.JWT_KEY!, { expiresIn: process.env.JWT_REFRESH_TTL! })

		this.setCookie(res, this.refresh_cookie_name, token)
	}

	private static setCookie(res: Response, name: string, token: string) {
		const expires = new Date()
		expires.setMonth(expires.getMonth() + 1)
		res.cookie(name, token, { expires })
	}
}
