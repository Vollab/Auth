import { Candidate } from './candidate'
import { User } from './user'

import { database } from 'common/services'

export interface FullCandidate extends User, Candidate {}

export interface FullCandidateWithActivityAreas extends FullCandidate {
	activity_areas: string[]
}

class FullCandidateModel {
	constructor(private db: typeof database) {}

	async findAllWithActivityAreas() {
		return this.db.query<FullCandidateWithActivityAreas>(
			`
			SELECT
				*
			FROM
				auth.full_candidate c
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

	async findByEmail(email: FullCandidate['email']) {
		return this.db.query<FullCandidate>(
			`
			SELECT
				*
			FROM
				auth.full_candidate
			WHERE
				email = $1
			LIMIT
				1
			;`,
			[email]
		)
	}
}

export const full_candidate_model = new FullCandidateModel(database)
