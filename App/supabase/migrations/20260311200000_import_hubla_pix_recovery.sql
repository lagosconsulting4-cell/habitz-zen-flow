-- ============================================================================
-- IMPORT: Hubla Pix Recovery Leads (CSV export 01/03 - 10/03/2026)
-- ============================================================================
-- Imports historical "Em aberto" (open) Pix leads from Hubla CSV export
-- into pending_purchases table. These appear in the admin Pix Recovery dashboard.
--
-- Source: Doc/Recuperacao_LEADS/e4f7a007-...csv
-- Cleaned: removed 6 test entries (testeeeeessss@gmail.com)
-- Result: 26 real leads (some emails appear 2x = different purchase attempts)
--
-- Uses ON CONFLICT-safe approach: skips rows that already exist in either
-- pending_purchases or purchases (by provider_session_id).

WITH new_leads (email, provider_session_id, provider_payment_intent, amount_cents, product_names, created_at) AS (
  VALUES
    -- Row 1: Raylan silva silva — Bora App R$97
    ('railansilvasilva03@gmail.com', '3796659f-08d3-4713-a46b-08b9e71e1689', '63c85743-3a60-420b-97fe-601484ff2c5d', 9700, 'Bora App', '2026-03-05 00:46:46'::timestamp AT TIME ZONE 'America/Sao_Paulo'),

    -- Row 2: Beatriz dos Santos lima — Foquinha AI R$87
    ('bl278887@gmail.com', '7eed7148-d4f9-4da2-a7c8-777486fdcfef', '702f3c3a-13bd-4e1c-81a8-a264016e42ae', 8700, 'Foquinha AI', '2026-03-05 10:53:23'::timestamp AT TIME ZONE 'America/Sao_Paulo'),

    -- Row 3: Otavio Gabriel Dos Santos — Bora App R$97
    ('otaviodossantos7@gmail.com', 'e01e4b2e-59f0-430b-b0e5-67105865a422', '91e68542-fbf1-4d4e-85bc-5f2bd0d33be9', 9700, 'Bora App', '2026-03-05 13:02:52'::timestamp AT TIME ZONE 'America/Sao_Paulo'),

    -- Row 4: Bruna Ribeiro — Bora App + Foquinha AI R$174
    ('brunaribeirodaconceicaodeassis@gmail.com', '00e0f199-8ed0-45a3-b828-43b541d02e71', 'a6d231b2-2fab-4142-a44e-2d72abe13fe2', 17400, 'Bora App, Foquinha AI', '2026-03-05 20:14:02'::timestamp AT TIME ZONE 'America/Sao_Paulo'),

    -- Row 5: Joao Lucas Ferreira Borges — Bora App R$97
    ('joaolucasferreiraborgea@gmail.com', '21100ea8-ada2-40f9-9298-651c7d9a182f', '9d5eb3a4-cdef-4f97-9684-07a0afd1e697', 9700, 'Bora App', '2026-03-05 21:34:35'::timestamp AT TIME ZONE 'America/Sao_Paulo'),

    -- Row 6: pedro lucas nogueira marques — Bora App R$97
    ('pedrolucasnogueiram2007@gmail.com', 'f31ac6e4-c49d-437d-8f08-4a08b57546c7', 'a51822a6-2cad-46ce-af5b-75c81eb24ad1', 9700, 'Bora App', '2026-03-05 22:00:39'::timestamp AT TIME ZONE 'America/Sao_Paulo'),

    -- Row 7: Dayene Beatriz de lima — Bora App R$141.90
    ('phdayblima@gmail.com', '5c7c6a87-949f-4a64-a699-1340b787ef51', '480c9c18-a761-456f-afd5-aee55eedba50', 14190, 'Bora App', '2026-03-05 22:20:07'::timestamp AT TIME ZONE 'America/Sao_Paulo'),

    -- Row 8: Agata vitoria pedroza — Bora App R$97
    ('agatavitoriapedroza@gmail.com', '12c0369b-b336-442d-9e77-0c99a1cfafe4', '76d88211-8b9a-4253-8d94-d0f8498774e1', 9700, 'Bora App', '2026-03-05 22:55:01'::timestamp AT TIME ZONE 'America/Sao_Paulo'),

    -- Row 9: Maria Clara Lopes Moraes — Bora App + Foquinha AI R$218.90
    ('lopesmoraesm4@gmail.com', 'bda1608d-e8e5-4381-93cd-2255d3dde906', '6ca53860-9fcf-42a6-a5a0-64b4e875b421', 21890, 'Bora App, Foquinha AI', '2026-03-06 12:19:25'::timestamp AT TIME ZONE 'America/Sao_Paulo'),

    -- Row 10: Anne Luyse — Foquinha AI R$87
    ('anneluysea15@gmail.com', '3d60de76-d41d-40ed-8459-4a517b1020cc', 'adaefe70-ff97-4472-acdf-f8b270879fc7', 8700, 'Foquinha AI', '2026-03-06 12:27:38'::timestamp AT TIME ZONE 'America/Sao_Paulo'),

    -- Row 11: Karla Cristina Lins De Arruda — Foquinha AI + Bora App R$174
    ('karrudalin@gmail.com', '0a859e99-f86b-4f6c-b337-3def249857fe', '001554bb-0e55-44bf-86de-1555d46cccc7', 17400, 'Foquinha AI, Bora App', '2026-03-06 15:49:50'::timestamp AT TIME ZONE 'America/Sao_Paulo'),

    -- Row 12: Davi da Conceicao Ferreira — Bora App + Foquinha AI R$184
    ('maxdavi126@gmail.com', 'b6c0e7fd-fe23-440b-8422-5a7d676fb297', 'f9a473ce-cf9c-48b4-9385-0b9a1d7bdcfe', 18400, 'Bora App, Foquinha AI', '2026-03-06 22:26:00'::timestamp AT TIME ZONE 'America/Sao_Paulo'),

    -- Row 13: Esteffany vitoria Alves campos — Bora App R$97
    ('esteffanyalvess15@gmail.com', '995dd38c-d5d4-433a-b2f8-13e789045a2d', '9137a1aa-7b10-4549-94ce-2980d43e8b59', 9700, 'Bora App', '2026-03-07 07:53:52'::timestamp AT TIME ZONE 'America/Sao_Paulo'),

    -- Row 14: Maria Eduarda Tomaz Silva — Bora App + Foquinha AI R$174
    ('mariaeduardatomazsilva707@gmail.com', 'e61a9658-a035-401a-8c9e-60fde5091f48', '71aad9db-04b6-49c3-bf25-cdafa2c12117', 17400, 'Bora App, Foquinha AI', '2026-03-07 15:36:09'::timestamp AT TIME ZONE 'America/Sao_Paulo'),

    -- Row 15: Luana Xavier — Foquinha AI R$87
    ('luanagxavier09@gmail.com', '4a161ed8-4817-4700-959c-223d8739f48f', '6e6b70f7-ffce-43ac-b77e-e01a2015f72e', 8700, 'Foquinha AI', '2026-03-07 19:30:12'::timestamp AT TIME ZONE 'America/Sao_Paulo'),

    -- Row 16: Tiago Henrique — Bora App R$97
    ('t8906281@gmail.com', 'a3af4aad-3673-4998-bf59-0195e979b094', '6e331f3e-9335-40f1-bce3-488f3905ea6f', 9700, 'Bora App', '2026-03-07 22:46:38'::timestamp AT TIME ZONE 'America/Sao_Paulo'),

    -- Row 17: Maria Magali Araujo Ferreira — Bora App R$97
    ('magaliaraujoferreira01@gmail.com', '16533c98-b438-4017-9488-350deb9e349d', '08bd0b6c-230f-4361-bd05-544b0aaf4ec3', 9700, 'Bora App', '2026-03-08 00:22:35'::timestamp AT TIME ZONE 'America/Sao_Paulo'),

    -- Row 18: Mayara Andrade de Santana — Bora App R$97
    ('andrademay2001@gmail.com', 'b4e494ef-7d4b-4dc9-87ff-3a20d6ac6496', '25501baf-ef91-4640-9319-544dcd27d6b4', 9700, 'Bora App', '2026-03-08 02:16:45'::timestamp AT TIME ZONE 'America/Sao_Paulo'),

    -- (6 test entries from testeeeeessss@gmail.com REMOVED)

    -- Row 19: Nicolly Eduarda dos Santos — Foquinha AI R$87
    ('nicollysantos8269@gmail.com', '9eca36ac-d571-4a8c-a405-416b390d4f92', '0c8d893f-097d-46c0-a0e2-57215ffc29c7', 8700, 'Foquinha AI', '2026-03-08 12:23:22'::timestamp AT TIME ZONE 'America/Sao_Paulo'),

    -- Row 20: Bianca de Jesus Souza Silva — Bora App R$97
    ('biancadesouza0911@gmail.com', 'a0e207c3-063a-44c7-b4ca-67ad56a8df7f', '9ea54e77-6217-4bb9-9b36-682322d7aee9', 9700, 'Bora App', '2026-03-08 13:17:19'::timestamp AT TIME ZONE 'America/Sao_Paulo'),

    -- Row 21: Victor Luiz — Bora App R$97 (1st attempt)
    ('vitinnxk93@gmail.com', '70036f12-293e-4f0f-8311-c655ea50c1aa', '0f1fdff0-0877-405c-8791-f7b957e7aff8', 9700, 'Bora App', '2026-03-08 20:40:01'::timestamp AT TIME ZONE 'America/Sao_Paulo'),

    -- Row 22: Victor Luiz — Bora App R$97 (2nd attempt, 13min later)
    ('vitinnxk93@gmail.com', 'f1807b7d-fa93-454f-a22e-42b7b6c734e5', 'dccfd1a4-2cca-4c58-855b-e1e306206b00', 9700, 'Bora App', '2026-03-08 20:53:27'::timestamp AT TIME ZONE 'America/Sao_Paulo'),

    -- Row 23: Wendel Sousa Matias — Bora App R$97
    ('wendels7edge@gmail.com', 'cbe5688d-b25a-4633-a1fc-73124976b5b6', '6ab2a57e-33ac-4f65-ac85-2aa51be712b3', 9700, 'Bora App', '2026-03-09 17:18:10'::timestamp AT TIME ZONE 'America/Sao_Paulo'),

    -- Row 24: Cicero Deilton — Foquinha AI + Bora App R$174 (combo)
    ('cicerodeilton401@gmail.com', '38aa58ba-0df8-40f1-a759-369dd8dde582', 'b3d46b2c-8d05-4e4f-98bf-fe726472fdd1', 17400, 'Foquinha AI, Bora App', '2026-03-10 00:09:32'::timestamp AT TIME ZONE 'America/Sao_Paulo'),

    -- Row 25: Cicero Deilton — Bora App R$97 (2nd attempt, 2min later)
    ('cicerodeilton401@gmail.com', '2f564a20-da95-4cb9-95df-48cadebea95f', 'f9428b4b-87d3-4dfb-8762-eb069bdc58e4', 9700, 'Bora App', '2026-03-10 00:11:23'::timestamp AT TIME ZONE 'America/Sao_Paulo'),

    -- Row 26: Mateus Vieira — Foquinha AI + Bora App R$174
    ('mavieirarosa12@gmail.com', '8c7c4c59-d2de-43ca-b1cb-180896f93450', 'd9f4ee72-9417-4c80-b1a3-f88dcd5cbab3', 17400, 'Foquinha AI, Bora App', '2026-03-10 11:20:23'::timestamp AT TIME ZONE 'America/Sao_Paulo')
)
INSERT INTO public.pending_purchases (email, provider, provider_session_id, provider_payment_intent, amount_cents, currency, status, product_names, created_at)
SELECT
  nl.email,
  'hubla',
  nl.provider_session_id,
  nl.provider_payment_intent,
  nl.amount_cents,
  'BRL',
  'open',
  nl.product_names,
  nl.created_at
FROM new_leads nl
WHERE NOT EXISTS (
  -- Skip if already in pending_purchases (same subscription)
  SELECT 1 FROM public.pending_purchases pp
  WHERE pp.provider_session_id = nl.provider_session_id
)
AND NOT EXISTS (
  -- Skip if already in purchases (webhook already captured it)
  SELECT 1 FROM public.purchases p
  WHERE p.provider_session_id = nl.provider_session_id
);
