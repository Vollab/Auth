import { AtLeastOne } from 'common/types/utility'
import { database } from 'common/services'

export interface Link {
	id: string
	user_id: string
	url: string
	text: string
	updated_at: Date
	created_at: Date
}

export type LinkInsert = Omit<Link, 'id' | 'updated_at' | 'created_at'>

class LinkModel {
	constructor(private db: typeof database) {}

	async insert(candidate_areas: AtLeastOne<LinkInsert>): Promise<Link[]>
	async insert(...candidate_areas: AtLeastOne<LinkInsert>): Promise<Link[]>
	async insert(candidate_area: AtLeastOne<LinkInsert> | LinkInsert) {
		const candidate_areas = Array.isArray(candidate_area) ? candidate_area : [candidate_area]
		const keys = Object.keys(candidate_areas[0])
		const placeholders = candidate_areas.map((_, ca_i) => `(${keys.map((_, k_i) => `$${1 + k_i + ca_i * keys.length}`).join(', ')})`).join(', ')
		const values = candidate_areas.map(ca => Object.values(ca)).flat()

		return this.db.query<Link>(
			`
			INSERT INTO
				auth.link (${keys.join(', ')})
			VALUES
				${placeholders}
			RETURNING
				*
			;`,
			values
		)
	}

	async delete(id: Link['id'], user_id: Link['user_id']) {
		return this.db.query<Link>(
			`
			DELETE FROM
				auth.link
			WHERE
        id = $1
      AND
        user_id = $2
			RETURNING
				*
			;`,
			[id, user_id]
		)
	}
}

export const link_model = new LinkModel(database)
