import { AtLeastOne } from 'common/types/utility'
import { database } from 'common/services'

export interface CandidateArea {
	candidate_id: string
	activity_area_id: string
}

class CandidateAreaModel {
	constructor(private db: typeof database) {}

	async findByCandidateId(candidate_id: CandidateArea['candidate_id']) {
		return this.db.query<CandidateArea>(
			`
			SELECT
				*
			FROM
				auth.candidate_area
			WHERE
        candidate_id = $1
			;`,
			[candidate_id]
		)
	}

	async insert(candidate_areas: AtLeastOne<CandidateArea>): Promise<CandidateArea[]>
	async insert(...candidate_areas: AtLeastOne<CandidateArea>): Promise<CandidateArea[]>
	async insert(candidate_area: AtLeastOne<CandidateArea> | CandidateArea) {
		const candidate_areas = Array.isArray(candidate_area) ? candidate_area : [candidate_area]
		const keys = Object.keys(candidate_areas[0])
		const placeholders = candidate_areas.map((_, ca_i) => `(${keys.map((_, k_i) => `$${1 + k_i + ca_i * keys.length}`).join(', ')})`).join(', ')
		const values = candidate_areas.map(ca => Object.values(ca)).flat()

		return this.db.query<CandidateArea>(
			`
			INSERT INTO
				auth.candidate_area (candidate_id, activity_area_id)
			VALUES
				${placeholders}
			RETURNING
				*
			;`,
			values
		)
	}

	async delete(candidate_id: CandidateArea['candidate_id'], activity_area_id: CandidateArea['activity_area_id']) {
		return this.db.query<CandidateArea>(
			`
			DELETE FROM
				auth.candidate_area
			WHERE
        candidate_id = $1
        activity_area_id = $2
			RETURNING
				*
			;`,
			[candidate_id, activity_area_id]
		)
	}
}

export const candidate_area_model = new CandidateAreaModel(database)
