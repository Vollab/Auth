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
	pgm.createFunction(
		'full_candidate_insert',
		[],
		{ language: 'plpgsql', returns: 'TRIGGER', cascade: true },
		`
    DECLARE v_user auth.user%ROWTYPE;
    DECLARE v_candidate auth.candidate%ROWTYPE;
    DECLARE v_full_candidate auth.full_candidate%ROWTYPE;

    BEGIN
      INSERT INTO auth.user (
        name,
        email,
        phone,
        biography,
        password
      ) VALUES (
        NEW.name,
        NEW.email,
        NEW.phone,
        NEW.biography,
        NEW.password
      )
      RETURNING * INTO v_user;

      INSERT INTO auth.candidate (
        id
      ) VALUES (
        v_user.id
      )
      RETURNING * INTO v_candidate;

      RAISE NOTICE '(%)', v_user;

      v_full_candidate := (v_user)::auth.full_candidate%ROWTYPE.*;
      v_full_candidate := (v_user).* || (v_candidate).*;

      RAISE NOTICE '(%)', v_full_candidate;
      RAISE NOTICE '(%)', NEW;
      RAISE NOTICE '(%)', OLD;

      RETURN v_full_candidate;
    END;
    `
	)
	pgm.createTrigger('full_candidate', 'full_candidate_insert', {
		when: 'INSTEAD OF',
		operation: 'INSERT',
		function: 'full_candidate_insert',
		level: 'ROW'
	})
	pgm.createFunction(
		'full_candidate_update',
		[],
		{ language: 'plpgsql', returns: 'TRIGGER' },
		`
    BEGIN
      UPDATE auth.user
      SET
        name = NEW.name,
        email = NEW.email,
        phone = NEW.phone,
        biography = NEW.biography,
        password = NEW.password
      WHERE id = OLD.id;

      -- UPDATE auth.candidate
      -- SET
      --   name = NEW.name
      --   email = NEW.email,
      --   phone = NEW.phone,
      --   biography = NEW.biography,
      --   password = NEW.password;
      -- WHERE id = OLD.id;

      RETURN NEW;
    END;
    `
	)
	pgm.createTrigger('full_candidate', 'full_candidate_update', {
		when: 'INSTEAD OF',
		operation: 'UPDATE',
		function: 'full_candidate_update',
		level: 'ROW'
	})
}

export async function down(pgm: MigrationBuilder): Promise<void> {
	pgm.dropTrigger('full_candidate', 'full_candidate_update', { ifExists: true })
	pgm.dropFunction('full_candidate_update', [], { ifExists: true })
	pgm.dropTrigger('full_candidate', 'full_candidate_insert', { ifExists: true })
	pgm.dropFunction('full_candidate_insert', [], { ifExists: true })
	pgm.dropView('full_candidate')
}
