import { PartialOmit } from 'common/types/utility'
import { database } from 'common/services'

export interface Avatar {
	id: string
	file_name: string
	file_path: string
	mime_type: string
	size: number
	created_at: Date
	updated_at: Date
}

class AvatarModel {
	constructor(private db: typeof database) {}

	async findById(id: Avatar['id']) {
		return this.db.query<Avatar>(
			`
			SELECT
				*
			FROM
				auth.avatar
			WHERE
				id = $1
			;`,
			[id]
		)
	}

	async insert(avatar: Omit<Avatar, 'updated_at' | 'created_at'>) {
		const { id, file_name, file_path, mime_type, size } = avatar

		return this.db.query<Avatar>(
			`
			INSERT INTO
				auth.avatar (id, file_name, file_path, mime_type, size)
			VALUES
				($1, $2, $3, $4, $5)
			RETURNING
				*
			;`,
			[id, file_name, file_path, mime_type, size]
		)
	}

	async update(id: Avatar['id'], avatar: PartialOmit<Avatar, 'id' | 'updated_at' | 'created_at'>) {
		const entries = Object.entries(avatar).filter(e => e[1])
		if (entries.length === 0) return []
		const keys = entries.map((e, i) => `${e[0]} = $${i + 2}`)
		const values = entries.map(e => e[1])

		return this.db.query<Avatar>(
			`
			UPDATE
				auth.avatar
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

	async delete(id: Avatar['id']) {
		return this.db.query<Avatar>(
			`
			DELETE FROM
				auth.avatar
			WHERE
				id = $1
			RETURNING
				*
			;`,
			[id]
		)
	}
}

export const avatar_model = new AvatarModel(database)
