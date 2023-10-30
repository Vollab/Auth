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
	pgm.createFunction(
		'full_orderer_insert',
		[],
		{ language: 'plpgsql', returns: 'TRIGGER', cascade: true },
		`
    DECLARE v_user auth.user;
    DECLARE v_orderer auth.orderer;
  
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
  
      INSERT INTO auth.orderer (
        id
      ) VALUES (
        v_user.id
      )
      RETURNING * INTO v_orderer;
  
      RETURN v_user, v_candidate;
    END;
    `
	)
	pgm.createTrigger('full_orderer', 'full_orderer_insert', {
		when: 'INSTEAD OF',
		operation: 'INSERT',
		function: 'full_orderer_insert',
		level: 'ROW'
	})
	pgm.createFunction(
		'full_orderer_update',
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

      -- UPDATE auth.orderer
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
	pgm.createTrigger('full_orderer', 'full_orderer_update', {
		when: 'INSTEAD OF',
		operation: 'UPDATE',
		function: 'full_orderer_update',
		level: 'ROW'
	})
}

export async function down(pgm: MigrationBuilder): Promise<void> {
	pgm.dropTrigger('full_orderer', 'full_orderer_update', { ifExists: true })
	pgm.dropFunction('full_orderer_update', [], { ifExists: true })
	pgm.dropTrigger('full_orderer', 'full_orderer_insert', { ifExists: true })
	pgm.dropFunction('full_orderer_insert', [], { ifExists: true })
	pgm.dropView('full_orderer', { ifExists: true })
}
