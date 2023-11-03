/* eslint-disable @typescript-eslint/naming-convention */
import { MigrationBuilder, ColumnDefinitions } from 'node-pg-migrate'

export const shorthands: ColumnDefinitions | undefined = undefined

export async function up(pgm: MigrationBuilder): Promise<void> {
	pgm.createTable(
		{ schema: 'auth', name: 'candidate_area' },
		{
			candidate_id: {
				type: 'uuid',
				notNull: true,
				references: 'candidate',
				onDelete: 'CASCADE',
				primaryKey: true
			},
			activity_area_id: {
				type: 'uuid',
				notNull: true,
				references: 'activity_area',
				onDelete: 'CASCADE',
				primaryKey: true
			}
		}
	)
}

export async function down(pgm: MigrationBuilder): Promise<void> {
	pgm.dropTable('candidate_area')
}
