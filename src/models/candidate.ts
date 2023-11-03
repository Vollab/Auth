import { User } from './user'

import { PartialOmit } from 'common/types/utility'
import { database } from 'common/services'

export interface Candidate extends User {
	id: string
	updated_at: string
	created_at: string
}

class CandidateModel {
	constructor(private db: typeof database) {}

	async findByEmail(email: Candidate['email']) {
		return this.db.query<Candidate>(
			`
			SELECT
				*
			FROM
				auth.candidate
			WHERE
				email = $1
			LIMIT
				1
			;`,
			[email]
		)
	}

	async insert(candidate: Omit<Candidate, 'id' | 'updated_at' | 'created_at'>) {
		const { name, email, biography, phone, password } = candidate

		return this.db.query<Candidate>(
			`
			INSERT INTO
				auth.candidate (name, email, biography, phone, password)
			VALUES
				($1, $2, $3, $4, $5)
			RETURNING
				*
			;`,
			[name, email, biography, phone, password]
		)
	}

	async update(id: Candidate['id'], candidate: PartialOmit<Candidate, 'id'>) {
		const entries = Object.entries(candidate).filter(e => e[1])
		const keys = entries.map((e, i) => `${e[0]} = $${i + 2}`)
		const values = entries.map(e => e[1])

		return this.db.query<Candidate>(
			`
			UPDATE
				auth.candidate
			SET
				${keys.join(', ')}${keys.length !== 0 ? ',' : ''} updated_at = now() at time zone 'utc'
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
