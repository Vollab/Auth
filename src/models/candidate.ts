import { User } from './user'

import { PartialOmit } from 'common/types/utility'
import { database } from 'common/services'

export interface Candidate extends User {}

export interface CandidateWithActivityAreas extends Candidate {
	activity_areas: string[]
}
class CandidateModel {
	constructor(private db: typeof database) {}

	async findAllWithActivityAreas() {
		return this.db.query<CandidateWithActivityAreas>(
			`
			SELECT
				*
			FROM
				auth.candidate c
			LEFT JOIN (
				SELECT
					candidate_id id, array_agg(name) activity_areas
				FROM
					auth.candidate_area
				JOIN
					auth.activity_area
				ON
					id = activity_area_id
				GROUP BY
					candidate_id
			) a
			USING (id)
			;`
		)
	}
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

	async update(id: Candidate['id'], candidate: PartialOmit<Candidate, 'id' | 'updated_at' | 'created_at'>) {
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
