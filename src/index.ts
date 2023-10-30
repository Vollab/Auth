import { app } from './app'

import { orderer_created_consumer, orderer_updated_consumer, candidate_created_consumer } from 'common/global/consumers'
import { logger, checkEnv, database, redis } from 'common/services'
import { nats_stream } from 'common/services/nats'

const start = async () => {
	try {
		checkEnv('SERVER_PORT', 'PG_HOST', 'PG_USER', 'PG_PASS', 'PG_DB', 'REDIS_HOST', 'NATS_HOST', 'JWT_KEY', 'JWT_ACCESS_TTL', 'JWT_REFRESH_TTL')

		await nats_stream.connect({ servers: process.env.NATS_HOST!, name: 'nats' })

		await database.connect({
			host: process.env.PG_HOST!,
			user: process.env.PG_USER!,
			password: process.env.PG_PASS!,
			database: process.env.PG_DB!,
			min: 0,
			max: 7
		})

		await redis.connect({
			socket: {
				host: process.env.REDIS_HOST!
			}
		})

		app.listen(process.env.SERVER_PORT!, () => logger.info(`${logger.BRIGHT('Listening on port:')} ${process.env.SERVER_PORT!}`))
	} catch (error) {
		logger.error(error)
	}
}

start()
