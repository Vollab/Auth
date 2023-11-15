import { Orderer } from './orderer'
import { User } from './user'

import { database } from 'common/services'

export interface FullOrderer extends User, Orderer {}

class FullOrdererModel {
	constructor(private db: typeof database) {}

	async findAll() {
		return this.db.query<FullOrderer>(
			`
			SELECT
				*
			FROM
				auth.full_orderer
			;`
		)
	}

	async findByEmail(email: FullOrderer['email']) {
		return this.db.query<FullOrderer>(
			`
			SELECT
				*
			FROM
				auth.full_orderer
			WHERE
				email = $1
			;`,
			[email]
		)
	}
}

export const full_orderer_model = new FullOrdererModel(database)
