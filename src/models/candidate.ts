import { PartialOmit } from 'common/types/utility'
import { database } from 'common/services'

export interface Candidate {
	id: string
}

class CandidateModel {
	constructor(private db: typeof database) {}

	async insert(candidate: Candidate) {
		const { id } = candidate

		return this.db.query<Candidate>(
			`
			INSERT INTO
				auth.candidate (id)
			VALUES
				($1)
			RETURNING
				*
			;`,
			[id]
		)
	}

	async update(id: Candidate['id'], candidate: PartialOmit<Candidate, 'id'>) {
		const entries = Object.entries(candidate).filter(e => e[1])
		if (entries.length === 0) return []
		const keys = entries.map((e, i) => `${e[0]} = $${i + 2}`)
		const values = entries.map(e => e[1])

		return this.db.query<Candidate>(
			`
			UPDATE
				auth.candidate
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

export const candidate_model = new CandidateModel(database)
