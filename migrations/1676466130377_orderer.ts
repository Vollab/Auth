import { MigrationBuilder, ColumnDefinitions } from 'node-pg-migrate'

export const shorthands: ColumnDefinitions | undefined = undefined

export async function up(pgm: MigrationBuilder): Promise<void> {
	pgm.createTable(
		{ schema: 'auth', name: 'orderer' },
		{
			id: {
				type: 'uuid',
				unique: true,
				notNull: true,
				primaryKey: true,
				references: 'user',
				onDelete: 'CASCADE'
			}
		}
	)

	pgm.createTrigger('orderer', 'updated_at', {
		when: 'BEFORE',
		operation: 'UPDATE',
		function: 'update_user_updated_at',
		level: 'ROW'
	})
}

export async function down(pgm: MigrationBuilder): Promise<void> {
	pgm.dropTrigger('orderer', 'updated_at', { ifExists: true })
	pgm.dropTable('orderer')
}
