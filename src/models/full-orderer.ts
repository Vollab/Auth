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

	async findById(id: FullOrderer['id']) {
		return this.db.query<FullOrderer>(
			`
			SELECT
				*
			FROM
				auth.full_orderer o
			LEFT JOIN LATERAL (
				SELECT
					user_id id, array_agg(json_build_object('id', id, 'url', url, 'text', text)) links
				FROM
					auth.link
				WHERE
					o.id = user_id
				GROUP BY
					user_id
			) l
			USING (id)
			WHERE
				id = $1
			;`,
			[id]
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
