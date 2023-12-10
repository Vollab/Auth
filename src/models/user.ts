import { UserType } from 'common/types/session-payload'
import { PartialOmit } from 'common/types/utility'
import { database } from 'common/services'

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

export interface UserWithRole extends User {
	role: UserType
}

class UserModel {
	constructor(private db: typeof database) {}

	async findAllWithRole() {
		return this.db.query<UserWithRole>(
			`
			SELECT
				u.*,
				CASE
					WHEN o.id IS NOT NULL THEN 'orderer'
					WHEN c.id IS NOT NULL THEN 'candidate'
				END role
			FROM
				auth.user u
			LEFT JOIN
				auth.orderer o
			USING (id)
			LEFT JOIN
				auth.candidate c
			USING (id)
			;`,
			[]
		)
	}

	async findByIdWithRole(id: User['id']) {
		return this.db.query<UserWithRole>(
			`
			SELECT
				u.*,
				CASE
					WHEN o.id IS NOT NULL THEN 'orderer'
					WHEN c.id IS NOT NULL THEN 'candidate'
				END role
			FROM
				auth.user u
			LEFT JOIN
				auth.orderer o
			USING (id)
			LEFT JOIN
				auth.candidate c
			USING (id)
			WHERE
				id = $1
			;`,
			[id]
		)
	}

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

	async findByEmailWithRole(email: User['email']) {
		return this.db.query<UserWithRole>(
			`
			SELECT
				u.*,
				CASE
					WHEN o.id IS NOT NULL THEN 'orderer'
					WHEN c.id IS NOT NULL THEN 'candidate'
				END role
			FROM
				auth.user u
			LEFT JOIN
				auth.orderer o
			USING (id)
			LEFT JOIN
				auth.candidate c
			USING (id)
			WHERE
				email = $1
			;`,
			[email]
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
		const entries = Object.entries(user).filter(e => e[1])
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
