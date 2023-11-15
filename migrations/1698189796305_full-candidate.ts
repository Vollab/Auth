import { MigrationBuilder, ColumnDefinitions } from 'node-pg-migrate'

export const shorthands: ColumnDefinitions | undefined = undefined

export async function up(pgm: MigrationBuilder): Promise<void> {
	pgm.createView(
		'full_candidate',
		{},
		`
    SELECT
      *
    FROM
      auth.user u
    JOIN
      auth.candidate o USING(id)
    `
	)
}

export async function down(pgm: MigrationBuilder): Promise<void> {
	pgm.dropView('full_candidate')
}
