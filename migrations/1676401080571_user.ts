import { MigrationBuilder, ColumnDefinitions } from 'node-pg-migrate'

export const shorthands: ColumnDefinitions | undefined = undefined

export async function up(pgm: MigrationBuilder): Promise<void> {
	pgm.createTable(
		{ schema: 'auth', name: 'user' },
		{
			id: {
				type: 'uuid',
				default: pgm.func('gen_random_uuid()'),
				notNull: true,
				primaryKey: true
			},
			name: {
				type: 'varchar(30)',
				notNull: true
			},
			email: {
				type: 'varchar(254)',
				notNull: true,
				unique: true
			},
			phone: {
				type: 'varchar(15)',
				notNull: true,
				unique: true
			},
			biography: {
				type: 'text',
				notNull: true
			},
			password: {
				type: 'varchar(161)',
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

	pgm.createFunction(
		'prevent_insert_into_parent',
		[],
		{ language: 'plpgsql', returns: 'TRIGGER' },
		`
    BEGIN
			RAISE EXCEPTION 'Cannot insert into parent table.';
		END;
    `
	)

	pgm.createTrigger('user', 'user_prevent_insert', {
		when: 'BEFORE',
		operation: 'INSERT',
		function: 'prevent_insert_into_parent',
		level: 'ROW'
	})

	pgm.createFunction(
		'update_updated_at',
		[],
		{ language: 'plpgsql', returns: 'TRIGGER' },
		`
    BEGIN
			NEW.updated_at = NOW() AT TIME ZONE 'utc';
			RETURN NEW;
		END;
    `
	)

	// pgm.createFunction(
	// 	'check_uniqueness',
	// 	[],
	// 	{ language: 'plpgsql', returns: 'TRIGGER' },
	// 	`
	//   BEGIN
	// 		IF EXISTS (
	// 			SELECT 1
	// 			FROM auth.user u
	// 			WHERE
	// 				u.email = NEW.email
	// 				OR
	// 				u.phone = NEW.phone
	// 		) THEN
	// 			RAISE EXCEPTION 'Duplicate value detected';
	// 		END IF;
	// 		RETURN NEW;
	// 	END;
	//   `
	// )
}

export async function down(pgm: MigrationBuilder): Promise<void> {
	// pgm.dropFunction('check_uniqueness', [], { ifExists: true })
	pgm.dropFunction('update_updated_at', [], { ifExists: true })
	pgm.dropTrigger('user', 'user_prevent_insert', { ifExists: true })
	pgm.dropFunction('prevent_insert_into_parent', [], { ifExists: true })
	pgm.dropTable('user')
}
