/* eslint-disable @typescript-eslint/naming-convention */
import { MigrationBuilder, ColumnDefinitions } from 'node-pg-migrate'

export const shorthands: ColumnDefinitions | undefined = undefined

export async function up(pgm: MigrationBuilder): Promise<void> {
	pgm.createTable(
		{ schema: 'auth', name: 'activity_area' },
		{
			id: {
				type: 'uuid',
				default: pgm.func('gen_random_uuid()'),
				notNull: true,
				primaryKey: true
			},
			name: {
				type: 'varchar(30)',
				notNull: true,
				unique: true
			},
			created_at: {
				type: 'timestamp with time zone',
				notNull: true,
				default: pgm.func("(now() at time zone 'utc')")
			},
			updated_at: {
				type: 'timestamp with time zone',
				notNull: true,
				default: pgm.func("(now() at time zone 'utc')")
			}
		}
	)

	pgm.createTrigger('activity_area', 'updated_at', {
		when: 'BEFORE',
		operation: 'UPDATE',
		function: 'update_updated_at',
		level: 'ROW'
	})
}

export async function down(pgm: MigrationBuilder): Promise<void> {
	pgm.dropTrigger('activity_area', 'updated_at', { ifExists: true })
	pgm.dropTable('activity_area')
}
