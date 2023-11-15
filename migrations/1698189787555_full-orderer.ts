import { MigrationBuilder, ColumnDefinitions } from 'node-pg-migrate'

export const shorthands: ColumnDefinitions | undefined = undefined

export async function up(pgm: MigrationBuilder): Promise<void> {
	pgm.createView(
		'full_orderer',
		{},
		`
    SELECT
      *
    FROM
      auth.user u
    JOIN
      auth.orderer o USING(id)
    `
	)
}

export async function down(pgm: MigrationBuilder): Promise<void> {
	pgm.dropView('full_orderer', { ifExists: true })
}
