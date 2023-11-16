import { MigrationBuilder, ColumnDefinitions } from 'node-pg-migrate'

export const shorthands: ColumnDefinitions | undefined = undefined

export async function up(pgm: MigrationBuilder): Promise<void> {
	pgm.createTable(
		{ schema: 'auth', name: 'avatar' },
		{
			id: {
				type: 'uuid',
				unique: true,
				notNull: true,
				primaryKey: true,
				references: 'user',
				onDelete: 'CASCADE'
			},
			file_name: {
				type: 'text',
				notNull: true,
				unique: true
			},
			file_path: {
				type: 'text',
				notNull: true
			},
			mime_type: {
				type: 'text',
				notNull: true
			},
			size: {
				type: 'int',
				notNull: true
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

	pgm.createTrigger('avatar', 'updated_at', {
		when: 'BEFORE',
		operation: 'UPDATE',
		function: 'update_updated_at',
		level: 'ROW'
	})

	pgm.createFunction(
		'create_default_avatar',
		[],
		{ language: 'plpgsql', returns: 'TRIGGER' },
		`
    BEGIN
			INSERT INTO
				auth.avatar (id, file_name, file_path, mime_type, size)
			VALUES
				(NEW.id, 'default_avatar', '/app/auth/uploads/default_avatar.gif', 'image/gif', 11096519);

			RETURN NEW;
		END;
    `
	)

	pgm.createTrigger('user', 'default_avatar', {
		when: 'AFTER',
		operation: 'INSERT',
		function: 'create_default_avatar',
		level: 'ROW'
	})
}

export async function down(pgm: MigrationBuilder): Promise<void> {
	pgm.dropTrigger('user', 'default_avatar', { ifExists: true })
	pgm.dropFunction('create_default_avatar', [], { ifExists: true })
	pgm.dropTrigger('avatar', 'updated_at', { ifExists: true })
	pgm.dropTable('avatar')
}
