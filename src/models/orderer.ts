import { User } from './user'

import { PartialOmit } from 'common/types/utility'
import { database } from 'common/services'

export interface Orderer extends User {}

class OrdererModel {
	constructor(private db: typeof database) {}

	async findAll() {
		return this.db.query<Orderer>(
			`
			SELECT
				*
			FROM
				auth.orderer
			;`
		)
	}

	async findByEmail(email: Orderer['email']) {
		return this.db.query<Orderer>(
			`
			SELECT
				*
			FROM
				auth.orderer
			WHERE
				email = $1
			;`,
			[email]
		)
	}

	async insert(orderer: Omit<Orderer, 'id' | 'updated_at' | 'created_at'>) {
		const { name, email, biography, phone, password } = orderer

		return this.db.query<Orderer>(
			`
			INSERT INTO
				auth.orderer (name, email, biography, phone, password)
			VALUES
				($1, $2, $3, $4, $5)
			RETURNING
				*
			;`,
			[name, email, biography, phone, password]
		)
	}

	async update(id: Orderer['id'], orderer: PartialOmit<Orderer, 'id' | 'updated_at' | 'created_at'>) {
		const entries = Object.entries(orderer).filter(e => e[1])
		if (entries.length === 0) return []
		const keys = entries.map((e, i) => `${e[0]} = $${i + 2}`)
		const values = entries.map(e => e[1])

		return this.db.query<Orderer>(
			`
			UPDATE
				auth.orderer
			SET
				${keys.join(', ')}
			WHERE
				id = $1
			RETURNING
				*
			;`,
			[id, ...values]
		)
	}
}

export const orderer_model = new OrdererModel(database)
