import express from 'express'

import { Session } from '../services'

const router = express.Router()

router.post('/api/sign-out', (req, res) => {
	Session.destroy(res)
	res.status(200).json()
})

export { router as sign_out_router }
