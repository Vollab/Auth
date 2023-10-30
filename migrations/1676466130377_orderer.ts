import { MigrationBuilder, ColumnDefinitions } from 'node-pg-migrate'

export const shorthands: ColumnDefinitions | undefined = undefined

export async function up(pgm: MigrationBuilder): Promise<void> {
	pgm.createTable(
		{ schema: 'auth', name: 'orderer' },
		{},
		{ inherits: 'user', like: { table: 'user', options: { including: ['INDEXES', 'CONSTRAINTS'] } } }
	)

	pgm.createTrigger('orderer', 'updated_at', {
		when: 'BEFORE',
		operation: 'UPDATE',
		function: 'update_updated_at',
		level: 'ROW'
	})

	// pgm.createTrigger('orderer', 'check_uniqueness', {
	// 	when: 'BEFORE',
	// 	operation: 'INSERT',
	// 	function: 'check_uniqueness',
	// 	level: 'ROW'
	// })
}

export async function down(pgm: MigrationBuilder): Promise<void> {
	// pgm.dropTrigger('orderer', 'check_uniqueness', { ifExists: true })
	pgm.dropTrigger('orderer', 'updated_at', { ifExists: true })
	pgm.dropTable('orderer')
}
