import { scrypt, randomBytes } from 'crypto'
import { promisify } from 'util'

const scrypt_async = promisify(scrypt)

export class Password {
	private constructor() {}

	static async to_hash(password: string) {
		const salt = randomBytes(16).toString('hex')

		const buf = (await scrypt_async(password, salt, 64)) as Buffer

		return `${buf.toString('hex')}.${salt}`
	}

	static async compare(hashed_password: string, password: string) {
		const [hash, salt] = hashed_password.split('.')

		const buf = (await scrypt_async(password, salt, 64)) as Buffer

		return buf.toString('hex') === hash
	}
}
