import { database } from 'common/services'
import { PartialOmit } from 'common/types/utility'

export interface User {
	id: string
	email: string
	name: string
	phone: string
	biography: string
	password: string
	updated_at: Date
	created_at: Date
}

class UserModel {
	constructor(private db: typeof database) {}

	async findByEmail(email: User['email']) {
		return this.db.query<User>(
			`
			SELECT
				*
			FROM
				auth.user
			WHERE
				email = $1
			;`,
			[email]
		)
	}

	async findByPhone(phone: User['phone']) {
		return this.db.query<User>(
			`
			SELECT
				*
			FROM
				auth.user
			WHERE
				phone = $1
			;`,
			[phone]
		)
	}

	async insert(user: Omit<User, 'id' | 'updated_at' | 'created_at'>) {
		const { name, email, biography, phone, password } = user

		return this.db.query<User>(
			`
			INSERT INTO
				auth.user (name, email, biography, phone, password)
			VALUES
				($1, $2, $3, $4, $5)
			RETURNING
				*
			;`,
			[name, email, biography, phone, password]
		)
	}

	async update(id: User['id'], user: PartialOmit<User, 'id' | 'email' | 'updated_at' | 'created_at'>) {
		const entries = Object.entries(user)
		if (entries.length === 0) return []
		const keys = entries.map((e, i) => `${e[0]} = $${i + 2}`)
		const values = entries.map(e => e[1])

		return this.db.query<User>(
			`
			UPDATE
				auth.user
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

export const user_model = new UserModel(database)
