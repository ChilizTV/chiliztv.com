# Plan v2 — Signalement communautaire + bannissement à périmètre restreint

> Remplace le plan v1. Toutes les affirmations ci-dessous ont été re-vérifiées contre le code
> le 2026-06-10 (audit fichier:ligne). Les corrections vs v1 sont marquées **[FIX v1]**.
> Décisions PO verrouillées inchangées (quorum 25 %, plancher N, escalade 24h→7j→permanent,
> fast-path sévérité ≥ 4, enforcement A2 backend re-route, soft-delete jamais physique).

---

## 0. Corrections factuelles vs plan v1 (audit 2026-06-10)

| # | Affirmation v1 | Réalité vérifiée | Impact |
|---|---|---|---|
| 1 | Concurrence quorum via `pg_advisory_xact_lock` + `ITransactionContext` | **Inexécutable** : le backend parle à Postgres via supabase-js uniquement (`infrastructure/database/supabase/client.ts`, service_role). Pas de connexion pg directe, pas de transactions applicatives, aucun advisory lock dans le code. | **[FIX v1]** Utiliser le **`RedisLockService` existant** (déjà utilisé par tous les jobs du `JobScheduler` pour le multi-instance Fly) + backstop d'idempotence par index unique partiel (cf. §4). Supprimer `ITransactionContext` du plan. |
| 2 | `chat_connected_users` PK `(match_id, user_id)`, présence à construire | PK = `id UUID` ; UNIQUE `(match_id, user_id)` ; colonnes **`wallet_address`** (migration 004), **`connected_at`**, **`last_activity`** déjà présentes (`000_init_schema.sql:103-120`). | La présence éligible (≥ X min, par wallet, match-level) est calculable **sans aucune migration** : `connected_at <= now()-X AND last_activity > now()-5min AND wallet_address IS NOT NULL`. |
| 3 | Rate-limit : `report_cooldown_sec` custom + Redis SETNX | `express-rate-limit` + `rate-limit-redis` déjà branchés (`rate-limit.middleware.ts`), MAIS **kill switch global actif : `RATE_LIMIT_DISABLED = true`** — tous les limiteurs sont skip en prod. | **[FIX v1]** Créer `reportsLimiter` qui **ignore le kill switch** (flag explicite), sinon l'anti-spam signalements est inopérant. Validation PO requise (cf. §9). |
| 4 | RLS chat : seul INSERT anon à révoquer | Migration 027 a donné `SELECT, INSERT, UPDATE, DELETE` à `anon` et `authenticated`, et une policy **`UPDATE USING (true)`** existe (`000_init_schema.sql:95-98`). **Vulnérabilité pré-existante : n'importe quel client anon peut éditer n'importe quel message.** | Le lockdown (LOT 4-B) doit révoquer **INSERT + UPDATE + DELETE** et dropper les policies INSERT/UPDATE, pas seulement INSERT. À signaler comme fix sécurité dans le commit. |
| 5 | `deleteLiveInput` détruit la config du streamer | Faux problème : `CreateStreamUseCase` appelle `createLiveInput` **à chaque création de stream** (input éphémère par stream, pas persistant par streamer). `deleteLiveInput(uid)` est donc le bon outil pour StopStream, sans dégât collatéral. | Décision v1 confirmée, inquiétude levée. |
| 6 | `live_streams.status` ∈ `active/ended` | `CHECK (status IN ('created','live','ended'))` depuis migration 006. | StopStream écrit `status='ended'` (valide). |
| 7 | Table paris off-chain `predictions`/`bets` avec `match_id` | Table **`bets`** (migration 022, parimutuel), keyed `(tx_hash, log_index)`, colonne **`user_address`** (lowercase), **pas de `match_id`** (lien via `contract_address + market_id`). `IBetRepository.countByUser` existe. | L'éligibilité "a déjà parié" = `countByUser(wallet) > 0` — pas besoin du match courant. |
| 8 | Broadcaster Realtime backend "pattern existant" | **Aucun** `channel().send()` côté backend. Le backend écrit en SQL, le front consomme via postgres_changes. Le broadcaster est de la **nouvelle infra** (risque assumé, fallback prévu §5). | Risque LOT 3 maintenu à "moyen", fallback polling explicite. |
| 9 | Hook front `useWalletAddress` | N'existe pas. Convention : `useDynamicContext()` → `primaryWallet?.address` (ex. `LiveDetailsPage.tsx:151`). | Corriger le `BanRealtimeProvider` (cf. §5). |
| 10 | `client_temp_id` indispensable à la dédup | `useChatRoom` a **déjà** une dédup optimiste (`mergeAndDedupOptimistic`, match par `(message, userId)` sur les rows `optimistic-*`) + polling fallback 4s. | `client_temp_id` conservé comme **durcissement** (dédup déterministe), mais le chat re-routé fonctionne même si cette plomberie glisse — risque LOT 4 abaissé. |
| 11 | Réactivation `SendMessageUseCase` triviale | Le use-case existe et la route `POST /chat/message/:matchId` aussi (`chat.routes.ts:8`), MAIS divergence de casse pré-existante : DB `CHECK message_type IN ('REGULAR','BET','SYSTEM','DONATION')` (migration 010) vs enum backend `MessageType.MESSAGE='message'` (minuscule). | **[FIX v1]** Le LOT 4-A doit vérifier le mapping du `SupabaseChatRepository` (écrit-il la casse attendue par le CHECK ?) + test L2 dédié, sinon premier envoi = violation de contrainte en prod. |
| 12 | Hooks chat API à créer | `chatApi.sendMessage` + `useSendMessage` **existent déjà** (dead code : `lib/api/endpoints/chat.ts:83-144`, `hooks/api/useChat.ts`). | Re-câbler l'existant, ne rien recréer (CLAUDE.md §8.3). |
| 13 | Cron à inventer pour l'expiration des bans | `JobScheduler` existe (node-cron / setInterval, lock Redis distribué par job). | `LiftExpiredBansJob` = un job de plus dans le pattern existant. Et l'**enforcement ne dépend plus du cron** (cf. §4, expiration dérivée). |

Faits v1 confirmés sans changement : Supabase front **anon-only** (`lib/supabase.ts:1-16`, zéro `setSession` dans tout le front) → A2 obligatoire ; `wallet_address` posé par le client dans l'insert chat (spoofing pré-existant, fermé par A2) ; dernière migration = **035** ; `viewer_sessions` session-token-keyed sans wallet (dénominateur stream-level repoussé V2) ; enums `SystemMessageType` divergents back (5) / front (8) ; playback HLS public non signé (gap V1 accepté) ; vitest + `test:integration` ; convention wallet lowercase partout (`users` PK, clés Redis, `bets.user_address`).

---

## 1. Décisions structurantes (rappel + nouvelles)

**Verrouillées PO (inchangées)** : actions auto au seuil (message soft-deleted / live stoppé / compte banni 24h) ; escalade 24h → 7j → permanent ; éligibilité reporter (présence ≥ X min OU bet historique off-chain) ; 1 report par wallet par cible par contexte live ; exclusion streamer + bannis du décompte ; plancher N en plus des 25 % ; config en DB (`report_config`) cachée Redis ; fast-path sévérité ≥ 4 (DSA/CSAE) ; A2 backend re-route ; kick realtime ; le banni **peut toujours parier** (ban 100 % off-chain, contrats intacts).

**Nouvelles décisions v2** :

1. **Rollout chat en deux temps, plus de lot "atomique"** **[FIX v1]**. Le verrouillage RLS et le re-routage front ne shippent plus dans le même deploy (risque élevé, rollback couplé). À la place : LOT 4-A déploie le chemin backend **pendant que le RLS reste ouvert** (les deux chemins d'écriture coexistent, zéro rupture, les onglets ouverts sur l'ancien front continuent de marcher) ; LOT 4-B (migration 037, one-liner) verrouille le RLS 24-48h plus tard, une fois les vieux clients purgés et le monitoring confirmant que tout passe par l'API. Rollback de 4-B = re-GRANT (réversible en secondes, indépendant du code).
2. **Expiration des bans dérivée du temps, pas du cron** : un ban est actif ssi `status='active' AND (expires_at IS NULL OR expires_at > clock.now())`. Le `LiftExpiredBansJob` ne fait que de l'hygiène (flip `status='expired'`, broadcast `lifted`). Si le job tombe, personne ne reste banni une seconde de trop — l'enforcement ne dépend d'aucun job.
3. **Sérialisation du quorum via `RedisLockService` existant** + backstop = index unique partiel sur `report_actions` (un double déclenchement concurrent viole l'unique → catch + ignore). Deux ceintures, zéro nouvelle infra.
4. **L'escalade ne compte que les bans non invalidés** : `status IN ('active','expired')`. Un ban levé par admin (`lifted_by_admin`) est présumé erroné et ne doit pas pousser le wallet vers le permanent.
5. **Pas de CHECK SQL sur `reason_code`** : la source de vérité est `packages/shared/.../reasonCodes.ts` (Zod à la frontière API + colonne TEXT). Un CHECK dupliquerait la taxonomie et imposerait une migration à chaque évolution. La `severity` est **calculée côté serveur** depuis la taxonomie — jamais reçue du client.
6. **`requireNotBanned` avec cache Redis** (hot path chat) : clé `ban:active:{wallet}` TTL 30s, `DEL` à la pose/levée du ban — même pattern que `auth:revoked:{wallet}`.

---

## 2. Modèle de données — migration `036_reports_bans.sql` (additive, non-breaking)

### Taxonomie — source unique `packages/shared/src/dto/reporting/reasonCodes.ts`

```typescript
export const REPORT_REASON_CODES = [
    'spam', 'harassment', 'hate_speech', 'violence', 'sexual_content',
    'child_safety', 'illegal_content', 'scam', 'off_topic', 'other',
] as const;
export type ReportReasonCode = (typeof REPORT_REASON_CODES)[number];
export const ReportReasonCodeSchema = z.enum(REPORT_REASON_CODES);

export const REASON_SEVERITY: Record<ReportReasonCode, 1 | 2 | 3 | 4 | 5> = {
    child_safety: 5,
    illegal_content: 4, violence: 4, sexual_content: 4,
    hate_speech: 3, scam: 3,
    harassment: 2, spam: 2,
    off_topic: 1, other: 1,
};
```

### `report_config` — singleton hot-reloadable

```sql
CREATE TABLE report_config (
    id                  SMALLINT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    quorum_pct          SMALLINT NOT NULL DEFAULT 25 CHECK (quorum_pct BETWEEN 1 AND 100),
    floor_count         SMALLINT NOT NULL DEFAULT 5 CHECK (floor_count >= 1),
    min_presence_sec    INT      NOT NULL DEFAULT 120 CHECK (min_presence_sec >= 0),
    ban_first_hours     INT      NOT NULL DEFAULT 24,
    ban_second_hours    INT      NOT NULL DEFAULT 168,
    bypass_severity_threshold SMALLINT NOT NULL DEFAULT 4 CHECK (bypass_severity_threshold BETWEEN 1 AND 5),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);
INSERT INTO report_config (id) VALUES (1) ON CONFLICT DO NOTHING;
```

(`report_cooldown_sec` v1 supprimé : le cooldown vit dans `reportsLimiter`, pas en DB.)

### `reports`

```sql
CREATE TYPE report_target_type AS ENUM ('stream', 'message', 'account');
CREATE TYPE report_status      AS ENUM ('open', 'auto_actioned', 'dismissed', 'closed');

CREATE TABLE reports (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    target_type             report_target_type NOT NULL,
    target_id               TEXT NOT NULL,            -- message: chat_messages.id / stream: live_streams.id / account: wallet lowercase
    reporter_wallet         TEXT NOT NULL,            -- lowercase (convention repo)
    live_context_match_id   BIGINT,
    live_context_stream_id  UUID,
    reason_code             TEXT NOT NULL,            -- validé par Zod à la frontière, pas de CHECK (cf. §1.5)
    reason_free_text        TEXT,
    severity                SMALLINT NOT NULL CHECK (severity BETWEEN 1 AND 5),  -- calculée serveur
    status                  report_status NOT NULL DEFAULT 'open',
    triggered_action_id     UUID,                     -- FK ajoutée après création de report_actions
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    reviewed_at             TIMESTAMPTZ,
    reviewed_by_wallet      TEXT,
    review_note             TEXT
);

-- [FIX v1] La contrainte UNIQUE inline sur colonne nullable ne déduplique pas les NULL :
-- deux index uniques partiels couvrent les deux cas proprement.
CREATE UNIQUE INDEX idx_reports_dedup_live
    ON reports (reporter_wallet, target_type, target_id, live_context_match_id)
    WHERE live_context_match_id IS NOT NULL;
CREATE UNIQUE INDEX idx_reports_dedup_global
    ON reports (reporter_wallet, target_type, target_id)
    WHERE live_context_match_id IS NULL;

CREATE INDEX idx_reports_target_open ON reports (target_type, target_id) WHERE status = 'open';
CREATE INDEX idx_reports_live_ctx    ON reports (live_context_match_id, target_type, target_id) WHERE status = 'open';
CREATE INDEX idx_reports_reporter    ON reports (reporter_wallet, created_at DESC);
CREATE INDEX idx_reports_admin_queue ON reports (status, severity DESC, created_at DESC);
```

### `bans`

```sql
CREATE TYPE ban_status AS ENUM ('active', 'expired', 'lifted_by_admin', 'lifted_by_appeal');

CREATE TABLE bans (
    id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_address           TEXT NOT NULL,           -- lowercase
    status                   ban_status NOT NULL DEFAULT 'active',
    triggered_by_report_id   UUID REFERENCES reports(id),
    triggering_live_match_id BIGINT,
    quorum_snapshot          JSONB NOT NULL,          -- shape §4 (inclut trigger: quorum|severity_bypass)
    starts_at                TIMESTAMPTZ NOT NULL DEFAULT now(),
    expires_at               TIMESTAMPTZ,             -- NULL = permanent
    ended_at                 TIMESTAMPTZ,
    escalation_index         SMALLINT NOT NULL CHECK (escalation_index >= 1),
    lifted_by_wallet         TEXT,
    lift_note                TEXT,
    created_at               TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at               TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- [NOUVEAU v2] Invariant : un seul ban actif par wallet, garanti par la DB.
CREATE UNIQUE INDEX idx_bans_one_active ON bans (wallet_address) WHERE status = 'active';
CREATE INDEX idx_bans_expiring ON bans (expires_at) WHERE status = 'active' AND expires_at IS NOT NULL;
CREATE INDEX idx_bans_history  ON bans (wallet_address, created_at DESC);
```

### `report_actions`

```sql
CREATE TYPE action_kind AS ENUM ('soft_delete_message', 'stop_stream', 'ban_account');

CREATE TABLE report_actions (
    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kind                  action_kind NOT NULL,
    target_type           report_target_type NOT NULL,
    target_id             TEXT NOT NULL,
    live_context_match_id BIGINT,
    quorum_snapshot       JSONB NOT NULL,
    reporter_wallets      TEXT[] NOT NULL,
    triggered_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    reversed_at           TIMESTAMPTZ,
    reversed_by_wallet    TEXT,
    reverse_note          TEXT,
    affected_message_id   UUID,
    affected_stream_id    UUID,
    affected_ban_id       UUID REFERENCES bans(id)
);

-- [FIX v1] La v1 écrivait `UNIQUE (...) WHERE ...` en contrainte de table : syntaxe SQL invalide.
-- Un index unique partiel avec COALESCE couvre aussi le contexte NULL.
CREATE UNIQUE INDEX idx_actions_one_active
    ON report_actions (target_type, target_id, COALESCE(live_context_match_id, -1))
    WHERE reversed_at IS NULL;

ALTER TABLE reports
    ADD CONSTRAINT fk_reports_action FOREIGN KEY (triggered_action_id) REFERENCES report_actions(id);
```

### `chat_messages` — soft-delete + dédup déterministe

```sql
ALTER TABLE chat_messages
    ADD COLUMN IF NOT EXISTS removed_at           TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS removed_by_action_id UUID REFERENCES report_actions(id),
    ADD COLUMN IF NOT EXISTS client_temp_id       UUID;

CREATE INDEX idx_chat_messages_visible ON chat_messages (match_id, created_at DESC) WHERE removed_at IS NULL;
```

### RLS / grants des nouvelles tables

```sql
ALTER TABLE reports        ENABLE ROW LEVEL SECURITY;
ALTER TABLE bans           ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_config  ENABLE ROW LEVEL SECURITY;
-- Zéro policy publique : lecture/écriture exclusivement via l'API backend (service_role bypass RLS).
GRANT SELECT, INSERT, UPDATE ON reports, bans, report_actions, report_config TO service_role;
```

**Le lockdown de `chat_messages` n'est PAS dans la 036** — il vit dans la `037` (LOT 4-B, cf. §3).

---

## 3. Enforcement chat — A2 confirmé, rollout en deux temps

### Pourquoi A2 (rappel, vérifié)

Le client Supabase front est anon-only (`lib/supabase.ts:1-16`, `realtime.setAuth(anonKey)` l.16, zéro `setSession` dans tout le front). Toute policy RLS référençant `auth.jwt()` est inopérante. Le backend connaît le wallet via son JWT (`authentication.middleware.ts`, `decoded.walletAddress`). A2 = le backend estampille `wallet_address` (ferme le spoofing client pré-existant, `supabase-chat.service.ts:105/451`), applique `requireNotBanned`, écrit en service_role. La **réception** des messages reste en Realtime direct (latence inchangée) ; seul l'envoi fait l'aller-retour API.

### LOT 4-A — bascule du chemin d'écriture (RLS encore ouvert)

- Backend : compléter `SendMessageUseCase` (déjà existant, route `POST /chat/message/:matchId` déjà câblée — `chat.routes.ts:8`) : stamp wallet depuis le JWT, persist `client_temp_id`, middleware `requireNotBanned` + `chatLimiter`.
- **Point de vigilance bloquant [FIX v1]** : DB `CHECK message_type IN ('REGULAR','BET','SYSTEM','DONATION')` (migration 010) vs enum backend `MessageType.MESSAGE='message'`. Vérifier le mapping `SupabaseChatRepository.saveMessage` et couvrir par un test L2 **avant** d'activer le chemin — sinon violation de contrainte au premier message.
- Frontend : `supabase-chat.service.ts` `sendMessage`/`sendStreamMessage` → `chatApi.sendMessage` (endpoint + hook `useSendMessage` **existent déjà en dead code**, les re-câbler). `useChatRoom` : passer `clientTempId` dans l'optimistic row ; `mergeAndDedupOptimistic` matche par `client_temp_id` d'abord, fallback sur l'heuristique `(message, userId)` actuelle.
- Pendant cette phase, l'INSERT direct anon reste **possible** : aucun client (à jour ou pas) ne casse.

### LOT 4-B — migration `037_chat_lockdown.sql` (24-48h après 4-A en prod)

```sql
DROP POLICY IF EXISTS "Allow insert access to chat messages" ON chat_messages;
DROP POLICY IF EXISTS "Allow update access to chat messages" ON chat_messages;  -- vuln pré-existante (cf. §0.4)
REVOKE INSERT, UPDATE, DELETE ON chat_messages FROM anon, authenticated;        -- 027 avait tout grant
-- SELECT conservé (lecture publique + Realtime postgres_changes inchangés).
```

Critère de GO : monitoring 24-48h montrant que 100 % des inserts `chat_messages` portent un `client_temp_id` ou matchent les logs backend `chat.message_sent` (les inserts directs n'en ont pas). Rollback : re-GRANT + re-CREATE policy — réversible en secondes, sans redéploiement de code.

À partir de 4-B : le ban chat est inviolable (middleware backend = seul chemin d'écriture), et la vuln UPDATE anon est fermée.

### Habilitant futur (inchangé, opt-in, hors scope)

Custom JWT Supabase signé backend → policies `TO authenticated` en défense en profondeur + send direct (-1 RT). ~1-2 j, à décider post-V1.

---

## 4. Backend — domain, use-cases, concurrence, expiration

### `packages/domain/src/reporting/`

Entités `Report`, `Ban`, `ReportAction` ; VO `LiveContext`, `QuorumSnapshot`. Shape du snapshot (audit + admin futur) :

```typescript
interface QuorumSnapshot {
    trigger: 'quorum' | 'severity_bypass';
    totalEligible: number | null;     // null si severity_bypass (pas de dénominateur)
    distinctReports: number;
    quorumPct: number;
    floorCount: number;
    maxSeverity: 1 | 2 | 3 | 4 | 5;
    evaluatedAt: string;              // ISO, via IClock
}
```

Ports (tous `I*` dans `domain/`, implémentations en `infrastructure/`) :
- `IReportRepository` — `save`, `existsForReporter(wallet, type, id, liveCtx | null)`, `findOpenOnTarget(type, id, liveCtx | null)`, `markActionedBatch(ids, actionId)`
- `IBanRepository` — `save`, `findActiveBan(wallet, now)` *(filtre `expires_at > now` en plus de `status='active'` — cf. décision §1.2)*, `countEscalating(wallet)` *(status IN active, expired — cf. §1.4)*, `findToExpire(now, limit)`, `markExpired(ids, now)`
- `IReportActionRepository` — `save` *(catch violation `idx_actions_one_active` → retourne l'existante)*, `findActiveForTarget(type, id, liveCtx | null)`
- `IPresenceService` — `getEligibleWallets(matchId, minPresenceSec, now)` → wallets lowercase distincts depuis `chat_connected_users` (`connected_at <= now - minPresenceSec AND last_activity > now - 5min`), streamer et bannis exclus par le use-case
- `IBetHistoryService` — `hasEverBet(wallet)` → wrap `IBetRepository.countByUser` existant
- `IModerationNotifier` — `notifyBanned(wallet, ban)`, `notifyBanLifted(wallet)`, `pushSystemMessage(matchId, type, payload)`
- `IReportConfigProvider` — `get()` (cache Redis 30s, invalidation à l'UPDATE)

### Policies pures (testées unitairement, zéro I/O, `now` injecté)

- **`ReportQuorumPolicy.evaluateQuorum(input): QuorumDecision`** — inchangée v1 : `maxSeverity ≥ bypass` → `trigger:severity_bypass` ; sinon plancher puis ratio.
- **`BanEscalationPolicy.nextBan(escalatingCount, config, now)`** — 0 antécédent → 24h ; 1 → 168h ; ≥ 2 → permanent (`expires_at = null`). Ne compte que les bans `active|expired` (§1.4).
- **`ReporterEligibilityPolicy.isEligible({ isPresent, hasEverBet, isStreamer, isBanned, isSelfReport })`** — pur, combinatoire testée exhaustivement.

### Use-cases (`application/reporting/use-cases/`)

- **`CreateReportUseCase`** — auto-signalement → `BusinessRuleError` ; éligibilité ; dédup via `existsForReporter` (et catch du unique index en backstop) ; `severity = REASON_SEVERITY[code]` côté serveur ; insert ; déclenche l'évaluation (await, <50ms, pas de file).
- **`EvaluateReportThresholdUseCase`** — **[FIX v1]** sérialisation par `RedisLockService.withLock('moderation:eval:' + type + ':' + id + ':' + (liveCtx ?? 'global'))` (infra existante des jobs) :
  1. `findActiveForTarget` → si action déjà posée, stop (idempotence niveau 1).
  2. Config + éligibles + reports ouverts + maxSeverity → `evaluateQuorum`.
  3. Si `trigger` : dispatch `SoftDeleteMessage` / `StopStream` / `BanAccount`, `markActionedBatch`, save `report_actions` — une violation de `idx_actions_one_active` lors d'une course résiduelle (lock Redis expiré) est catchée et traitée comme "déjà fait" (idempotence niveau 2, garantie par la DB).
- **`SoftDeleteMessageUseCase`** — `UPDATE chat_messages SET removed_at = clock.now(), removed_by_action_id = ...` + `pushSystemMessage(MESSAGE_REMOVED)`.
- **`StopStreamUseCase`** — `live_streams.status = 'ended'` + `cloudflareStreamService.deleteLiveInput(uid)` (input éphémère par stream, cf. §0.5 — pas de dégât) + `pushSystemMessage(STREAM_STOPPED)` ; le viewer-side kill est déjà géré par le Realtime existant sur `live_streams` (hls.destroy au passage à ended).
- **`BanAccountUseCase`** — `countEscalating` → `BanEscalationPolicy` → insert (l'index `idx_bans_one_active` garantit l'unicité) → `DEL ban:active:{wallet}` → `notifyBanned`. **Cascade** : si le banni streame un live actif → `StopStreamUseCase`.
- **`LiftExpiredBansUseCase`** — job `JobScheduler` (pattern existant, lock Redis, 60s) : `findToExpire` → `markExpired` → `DEL ban:active:{wallet}` → `notifyBanLifted`. **Hygiène seulement** : l'enforcement lit `expires_at` (§1.2), un job en panne ne prolonge aucun ban.

### Middleware `requireNotBanned`

Lecture `ban:active:{wallet}` (Redis, TTL 30s, peuplé au miss depuis `findActiveBan`) ; 403 `{ code: 'ACCOUNT_BANNED', expiresAt }` si actif. Appliqué à `POST /reports`, `POST /chat/message/:matchId`, `POST /stream/:id/join` (et création de stream). **Jamais** sur les routes de pari. Invalidation par `DEL` à la pose/levée (cohérent avec `auth:revoked:{wallet}`).

### Rate-limit **[FIX v1 — kill switch]**

`reportsLimiter` (5/min + 30/h par wallet JWT) dans `rate-limit.middleware.ts`, **avec un flag `bypassKillSwitch`** : `RATE_LIMIT_DISABLED = true` skip aujourd'hui tous les limiteurs en prod ; sans ce flag, l'anti-spam signalements n'existerait pas. → Validation PO (§9.3).

### Logs Pino + métriques

`report.created`, `report.threshold_reached` (avec snapshot + decisionReason), `ban.issued`, `ban.lifted`, `chat.message_sent` (sert aussi de signal de monitoring pour le GO du LOT 4-B). Counters : `reports.created_total`, `bans.issued_total`, `actions.severity_bypass_total`, ratio levées/posés (proxy faux positifs).

---

## 5. Frontend — 4 couches, provider, composants

### Couches 1-4 (convention CLAUDE.md §3.2bis)

- DTOs `packages/shared/src/dto/reporting/` : `CreateReportDto` (le client n'envoie **pas** `severity`), `BanStatusResponseDto` (`200 { ban: null }`, jamais 404), `SendChatMessageDto` (+ `clientTempId`), `ReportConfigDto`. Export barrel `packages/shared/src/index.ts`.
- Endpoints : `reportsApi.create`, `bansApi.me`, `reportConfigApi.get` ; `chatApi.sendMessage` **réutilisé** (dead code existant, `lib/api/endpoints/chat.ts:83`).
- Query keys : `queryKeys.bans.me()`, `queryKeys.reports.config()`.
- Hooks : `useCreateReport` (mutation), `useMyBan` (query, `staleTime` 30s, `refetchOnWindowFocus: true` — **fallback du kick realtime**), `useReportConfig` (staleTime 5 min).

### `BanRealtimeProvider` — subscription unique

Monté dans `app/layout.tsx` entre `QueryProvider` et `UsernameSetupGuard` (providers existants vérifiés). Wallet obtenu via `useDynamicContext().primaryWallet?.address` **[FIX v1** — `useWalletAddress` n'existe pas**]**, normalisé `.toLowerCase()` (clé de canal = `bans:{wallet_lower}`, cohérent avec la convention repo). Events `banned` (setQueryData + toast + `router.push('/dashboard')`) et `lifted` (invalidate + toast). Le broadcaster backend étant de la **nouvelle infra** (§0.8), le kick a un fallback double : `useMyBan` refetch au focus + enforcement serveur de toute façon (le kick raté = purement cosmétique).

### Composants (1 fichier = 1 composant, §3.3bis)

`components/features/moderation/` : `ReportDialog.tsx` (SheetShell + steps façon MarketBetDialog, toast sonner), `ReportButton.tsx`, `BannedBanner.tsx` (plein page sur `/live`, copy explicite incluant le gap HLS : « ton accès au live est suspendu »), `BanDashboardTile.tsx` (slot `DashboardHero` — `sections/DashboardHero.tsx`, après les action pills), `RemovedMessagePlaceholder.tsx`, hook `useReportContext.ts`.

Gating : `LiveDetailsPage.tsx` (early return après l.221) ; `ChatComposer.tsx:36` input disabled + placeholder ; `ChatMessageItem` → placeholder si `removedAt`. Tout le gating front est cosmétique — l'enforcement est serveur.

### SystemMessageType — alignement back/front (LOT 7)

Backend (5 valeurs) et front (8 : + `DONATION`, `SUBSCRIPTION`, `BET_PLACED`) divergent déjà. Ajouter `MESSAGE_REMOVED` + `STREAM_STOPPED` **dans les deux**, mettre à jour palette/labels (`ChatMessageItem`, `LatestSystemBanner`). Grep préalable des 3 valeurs front-only pour ne rien casser.

---

## 6. Lots (ordre, dépendances, shippable isolément)

| Lot | Contenu | Est. | Risque | Dépend de |
|---|---|---|---|---|
| **1** | Migration `036` (additive : 4 tables + colonnes chat). Staging → prod. | 0.5 j | Nul | — |
| **2** | Domain : entités, VO, ports, 3 policies pures + tests vitest exhaustifs. | 0.5 j | Nul | — |
| **3** | Infra : 3 repos Supabase, `PresenceQueryService` (sur `chat_connected_users` existante), `BetHistoryService` (wrap `IBetRepository`), `ReportConfigCache`, `SupabaseModerationNotifier` (broadcast — nouvelle infra), DI. | 1 j | Moyen (notifier) | 1, 2 |
| **4-A** | Use-cases + controllers + `requireNotBanned` + `reportsLimiter` + job expiration + **chat re-route** (backend `SendMessageUseCase` complété + front `chatApi.sendMessage`) — **RLS encore ouvert, zéro rupture**. Inclut le test L2 casse `message_type` (§3, bloquant). | 1.5 j | Moyen | 3 |
| **4-B** | Migration `037` lockdown RLS chat (drop policies INSERT/UPDATE + revoke). **24-48h après 4-A en prod**, GO sur monitoring `chat.message_sent`. Rollback = re-GRANT. | 0.25 j | Faible (réversible) | 4-A + délai |
| **5** | Front infra : DTOs, endpoints, keys, hooks, `BanRealtimeProvider`. | 0.5 j | Nul | 2 (DTOs) |
| **6** | Front UI : 5 composants moderation + gating live/chat/dashboard. | 1.5 j | Faible | 5 |
| **7** | System messages `MESSAGE_REMOVED` / `STREAM_STOPPED` back + front + palette. | 0.5 j | Faible | 4-A |
| **8** | Tests : fixtures L1, scénarios L2, intégration L4 (quorum, fast-path, ban, RLS lockdown), smoke E2E. | 0.5 j | Faible | 4-B, 6 |

**Total ~6.5 j solo.** Chemin critique : 1 → 3 → 4-A → (délai) → 4-B. Les lots 5-6 se font **en parallèle** de 4-A/4-B (le délai de 24-48h du 4-B n'est plus du temps mort). **[FIX v1]** : plus aucun deploy atomique multi-surface.

---

## 7. Edge cases & sécurité

| Cas | Mitigation |
|---|---|
| Sybil (wallets jetables) | Éligibilité : présence ≥ X min (`chat_connected_users.connected_at`, wallet requis) OU bet historique (`bets.user_address`). Wallets anonymes sans wallet_address en présence = inéligibles d'office. |
| Brigading coordonné | Plancher `floor_count` (5) en plus des 25 %. Config ajustable à chaud. |
| Auto-signalement / streamer / déjà banni | Rejets dans `ReporterEligibilityPolicy` (422 / 403) + exclusion du dénominateur. |
| Course sur le déclenchement | Lock Redis (`RedisLockService` existant) + index unique partiel `idx_actions_one_active` en backstop DB — double déclenchement impossible même si le lock expire. **[FIX v1 : advisory lock pg inexécutable via supabase-js]** |
| Double ban concurrent | `idx_bans_one_active` (DB-level, nouveau v2). |
| Ban expiré mais job en panne | Aucun impact : enforcement dérivé de `expires_at` (§1.2). |
| Escalade injuste après ban annulé | `countEscalating` exclut `lifted_by_admin` / `lifted_by_appeal` (§1.4). |
| Banni envoie un chat | 4-A : middleware 403. Post 4-B : RLS rend le contournement impossible même hors API. |
| Banni regarde le live via l'URL HLS | Gap V1 connu (CF playback public non signé) — copy `BannedBanner` explicite ; lot signed-URLs en V2. |
| Vieux clients pendant le rollout | Fenêtre 4-A→4-B : les deux chemins d'écriture coexistent. Plus de scénario « chat cassé ». |
| Spoofing `wallet_address` chat (pré-existant) | Fermé en 4-A (stamp JWT) + verrouillé en 4-B. |
| UPDATE anon sur chat_messages (vuln pré-existante) | Fermée en 4-B (drop policy + revoke). À mentionner dans le commit. |
| Multi-streams par match | Dénominateur match-level V1 (`chat_connected_users`) ; `viewer_sessions.wallet_address` en V2 si besoin stream-level. |
| Casse `message_type` à la réactivation du chemin backend | Test L2 bloquant avant activation (§3, LOT 4-A). |

---

## 8. Plan de test

- **L1 fixtures** : `report.fixtures.ts` (`streamReport` / `messageReport` / `accountReport`), `ban.fixtures.ts` (`active({ escalationIndex })`, `expired`, `permanent`). IDs match dans le range réservé via `nextTestMatchId()`.
- **Unitaires (vitest)** : 3 policies — quorum (plancher, ratio, bypass, bornes), escalade (0/1/2+ antécédents, exclusion lifted), éligibilité (combinatoire complète). `MockClock` partout.
- **L2 scénarios** (`pnpm match:scenario`) : `report-message-quorum` (3/10 sous plancher → rien ; 5/10 → soft-delete), `report-child-safety` (1 report → action immédiate), `ban-escalation` (24h → 7j → permanent), `chat-via-backend` (casse message_type, **bloquant 4-A**).
- **L4 intégration** (Anvil + Supabase local, config existante `vitest.integration.config.ts`) : flux quorum complet (5 wallets → `report_actions` + `removed_at` + echo Realtime), fast-path, kick broadcast reçu par un subscriber simulé, **post-037 : INSERT/UPDATE anon direct → 42501**.
- **Front** : snapshots `ReportDialog` (steps) / `BannedBanner` ; `useMyBan` avec mock realtime ; smoke E2E banni sur `/live/:id`.

---

## 9. Validations PO requises avant exécution

1. **Migration `036`** (schéma §2) — GO/NO-GO (CLAUDE.md §9).
2. **Migration `037`** (lockdown chat) + critère de GO du délai 4-A→4-B — GO/NO-GO.
3. **Rate-limit** : le kill switch global `RATE_LIMIT_DISABLED = true` est actif en prod. Valider le flag `bypassKillSwitch` pour `reportsLimiter` (sans lui, pas d'anti-spam signalements) — ou décider de réactiver le rate-limiting global.
4. **Enums `MESSAGE_REMOVED` / `STREAM_STOPPED`** (ajout back + front) — validation demandée par convention.
5. **Fast-path sévérité** : confirmation produit/légale (consultation juridique recommandée — DSA art. 16).
6. **Gap HLS playback** V1 cosmétique — confirmer l'acceptation ou prioriser le lot signed-URLs.
7. Aucune nouvelle dépendance npm requise (vérifié : sonner, express-rate-limit, rate-limit-redis, ioredis, node-cron déjà installés).

---

## 10. Fichiers critiques (récap exécution)

| Fichier | Lot | Action |
|---|---|---|
| `apps/backend/src/infrastructure/database/migrations/036_reports_bans.sql` | 1 | nouveau |
| `apps/backend/src/infrastructure/database/migrations/037_chat_lockdown.sql` | 4-B | nouveau (5 lignes) |
| `packages/shared/src/dto/reporting/*` (reasonCodes + DTOs) | 2/5 | nouveau |
| `packages/domain/src/reporting/{entities,policies,ports}/*` | 2 | nouveau + tests |
| `apps/backend/src/infrastructure/persistence/repositories/Supabase{Report,Ban,ReportAction}Repository.ts` | 3 | nouveau |
| `apps/backend/src/infrastructure/services/{PresenceQueryService,BetHistoryService,ReportConfigCache,SupabaseModerationNotifier}.ts` | 3 | nouveau |
| `apps/backend/src/application/reporting/use-cases/*` (6 use-cases) | 4-A | nouveau |
| `apps/backend/src/application/chat/use-cases/SendMessageUseCase.ts` | 4-A | complété (ban check, stamp wallet, clientTempId) |
| `apps/backend/src/presentation/http/middlewares/{require-not-banned,rate-limit}.middleware.ts` | 4-A | nouveau / modifié (`reportsLimiter` + `bypassKillSwitch`) |
| `apps/backend/src/presentation/http/controllers/{reporting,ban}.controller.ts` + routes | 4-A | nouveau |
| `apps/backend/src/infrastructure/scheduling/` → `LiftExpiredBansJob` | 4-A | nouveau (pattern JobScheduler existant) |
| `apps/frontend/services/supabase-chat.service.ts` | 4-A | refactor insert direct → `chatApi.sendMessage` |
| `apps/frontend/hooks/useChatRoom.ts` | 4-A | dédup par `clientTempId` (fallback heuristique conservé) |
| `apps/frontend/lib/api/endpoints/{reports,bans,reportConfig}.ts` + `lib/query/keys.ts` + `hooks/api/*` | 5 | nouveau ; `chatApi`/`useSendMessage` ré-utilisés |
| `apps/frontend/app/providers/BanRealtimeProvider.tsx` (+ montage `app/layout.tsx`) | 5 | nouveau |
| `apps/frontend/components/features/moderation/*` (6 fichiers) | 6 | nouveau |
| `apps/frontend/components/live/LiveDetailsPage.tsx` (gating ~l.221) + `chat/{ChatComposer,ChatMessageItem,LatestSystemBanner}.tsx` | 6/7 | modifiés |
| `apps/frontend/models/chat.model.ts` + `apps/backend/src/shared/enums/message.enums.ts` | 7 | + 2 enums chacun |
| `apps/frontend/components/features/dashboard/sections/DashboardHero.tsx` | 6 | + slot `BanDashboardTile` |

---

## 11. Vérification post-implémentation

- `pnpm --filter @chiliztv/domain test` / backend `test` + `test:integration` / frontend `type-check` — verts.
- Smoke staging puis prod :
  - `POST /reports` JWT valide → 201 ; doublon → 409 ; banni → 403 ; spam > 5/min → 429 (**vérifie que le limiter bypass bien le kill switch**).
  - `GET /bans/me` → `200 { ban: null }` ou `200 { ban: {...} }`.
  - Envoi chat via l'app → message visible en Realtime, `message_type` conforme au CHECK.
  - Post-037 : `INSERT`/`UPDATE` anon direct sur `chat_messages` → 42501.
  - Seed 5 reports message → soft-delete + `MESSAGE_REMOVED` ; seed 1 `child_safety` → action immédiate.
  - Browser banni : kick < 2s (broadcast) ou au focus (fallback), `/live/:id` → `BannedBanner`, composer disabled, tuile dashboard avec expiration.
- Monitoring 7 j : ratio `bans.issued_total / reports.created_total`, `actions.severity_bypass_total`, part des messages sans `client_temp_id` (doit tendre vers 0 avant 4-B).

