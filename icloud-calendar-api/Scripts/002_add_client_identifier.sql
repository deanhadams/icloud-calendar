-- Generated via `dotnet ef migrations script InitialCreate --idempotent` from Migrations/20260906075108_AddClientIdentifierToClients.
-- Adds a public-facing GUID identifier to Clients, DB-generated and unique.
-- Do not hand-edit; regenerate from EF migrations if the model changes.

START TRANSACTION;


DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260906075108_AddClientIdentifierToClients') THEN
    ALTER TABLE "Clients" ADD "ClientIdentifier" uuid NOT NULL DEFAULT (gen_random_uuid());
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260906075108_AddClientIdentifierToClients') THEN
    CREATE UNIQUE INDEX "IX_Clients_ClientIdentifier" ON "Clients" ("ClientIdentifier");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260906075108_AddClientIdentifierToClients') THEN
    INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
    VALUES ('20260906075108_AddClientIdentifierToClients', '8.0.11');
    END IF;
END $EF$;
COMMIT;
