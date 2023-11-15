import { PartialOmit } from 'common/types/utility'
import { database } from 'common/services'

export interface Orderer {
	id: string
}

class OrdererModel {
	constructor(private db: typeof database) {}

	async insert(orderer: Orderer) {
		const { id } = orderer

		return this.db.query<Orderer>(
			`
			INSERT INTO
				auth.orderer (id)
			VALUES
				($1)
			RETURNING
				*
			;`,
			[id]
		)
	}

	async update(id: Orderer['id'], orderer: PartialOmit<Orderer, 'id'>) {
		const entries = Object.entries(orderer)
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
