# Prompt — Plan d'implémentation : signalement + bannissement communautaire

> À coller tel quel à l'agent IA du repo. **Objectif : produire un PLAN, pas du code.**
> L'agent doit s'arrêter et attendre validation avant toute écriture.

---

## Rôle & objectif

Tu es l'agent de dev du monorepo **PredCast** (ex-chiliztv, packages internes encore nommés `@chiliztv/*` — **ne renomme rien dans le cadre de ce travail**). Tu dois **planifier** l'ajout d'un système de **signalement communautaire + bannissement à périmètre restreint**. Tu ne produis **aucun code** à ce stade : tu rends un plan d'implémentation ordonné, découpé en lots, et tu listes les décisions qui requièrent ma validation. Respecte `CLAUDE.md` à la lettre (règle « Plan avant code », §8).

## Étape 0 — Lecture & vérification obligatoires (avant de planifier)

1. Lis **`CLAUDE.md`** (racine) en entier. (Note : les sous-`CLAUDE.md` `apps/frontend` / `apps/backend` évoqués au §10 n'existent pas encore — ne les invente pas.)
2. **Vérifie par toi-même** l'état réel des fichiers/tables ci-dessous (ce prompt peut comporter des écarts ; signale-les) :
   - Chat front (écriture **navigateur → Supabase en direct**) : `apps/frontend/services/supabase-chat.service.ts`, hook `apps/frontend/hooks/useChatRoom.ts`, vues `apps/frontend/components/live/chat/*` (`ChatPanel`, `ChatMessageItem`, `LatestSystemBanner`), `components/live/Chats.tsx`.
   - Chat back (chemin serveur) : `apps/backend/src/application/chat/use-cases/SendMessageUseCase.ts`, `infrastructure/persistence/repositories/SupabaseChatRepository.ts`, enums `apps/backend/src/shared/enums/message.enums.ts`.
   - Tables : `chat_messages`, `chat_connected_users` (présence, clé `match_id` + `user_id`), `viewer_sessions` (migration `007_viewer_sessions_and_thumbnails.sql`), users/profil (`014_users_profile.sql`).
   - Présence / sessions stream : `apps/backend/src/infrastructure/services/ViewerSessionService.ts`, `application/streams/use-cases/UpdateViewerCountUseCase.ts`, `presentation/http/controllers/stream.controller.ts`.
   - Auth : `apps/backend/src/presentation/http/middlewares/authentication.middleware.ts` (JWT wallet-based + **liste de révocation Redis `auth:revoked:{wallet}`, tout-ou-rien**).
   - Migrations : `apps/backend/src/infrastructure/database/migrations/` — **dernière = `035`**, donc la tienne sera **`036_…`**. Précédents RLS/grants : `018_rls_waitlist.sql`, `025`/`026`/`027`.
   - Dashboard : route `apps/frontend/app/dashboard/page.tsx` → `components/features/dashboard/Dashboard.tsx` (sections `DashboardHero`, `StatsHero`, `MainTabs` ; composants `StatusPill`, `PnlBadge`).
   - Live : route **`apps/frontend/app/live/[...id]/page.tsx`** → `components/live/LiveDetailsPage.tsx`.
   - Patterns modale/toast à réutiliser : `components/live/dialog/*`, `components/live/streamer-modals/shared/StreamerModalShell.tsx`, `components/live/sheets/SheetShell.tsx`, `MarketBetDialog.tsx` ; toasts via **`sonner`** (déjà utilisé).
   - Convention d'appel backend (4 couches) de référence : `pricesApi` + `usePrices` + `queryKeys` (cf. `CLAUDE.md` §3.2bis).

## Faits structurants (à confirmer, puis à exploiter)

- **Le pari est 100 % on-chain** (wagmi → contrats, backend hors du chemin). Donc « le banni peut toujours parier » est satisfait **gratuitement** : le ban est **purement off-chain** et ne doit toucher ni les contrats ni le flux de pari.
- **Le chat s'écrit en direct navigateur → Supabase** (RLS). Bloquer l'envoi d'un banni ne peut donc **pas** se faire uniquement côté UI : il faut une **application serveur** (politique RLS référençant la table des bans, **ou** re-router les envois via le backend authentifié). C'est **la** décision d'archi à trancher dans le plan.
- La **révocation Redis existante est tout-ou-nuit** (le wallet ne peut plus rien faire) → **ne pas la réutiliser** pour ce ban, car le banni doit garder le pari. Introduire un **ban à périmètre restreint** (voir/chatter bloqués, pari autorisé).
- Il peut y avoir **plusieurs streams par match** (StreamSwitcher) : définis le dénominateur « présents sur le live » au bon niveau (par stream pour une action stream, via `viewer_sessions` ; par match via `chat_connected_users` sinon).

## Spécification fonctionnelle

**Signalement (reporting)** — trois cibles : un **live/stream**, un **message**, un **compte**.
- Le bouton « Signaler » ouvre une **modale demandant la raison** (taxonomie d'enum + texte libre optionnel), puis à la confirmation affiche un **toast de succès** (`sonner`).
- **Seuil de déclenchement** : quand **≥ 25 %** des présents **éligibles** sur le live ont signalé une même cible → action automatique (voir décisions verrouillées).

**Bannissement (à périmètre restreint)** — un compte banni :
- ❌ ne peut plus **voir les lives**, ❌ ne peut plus **envoyer de chat**, ❌ ne peut plus **signaler** ;
- ✅ peut **toujours parier** ;
- voit dans l'**UI** son état banni (page live + champ chat bloqués + bannière « tu es banni jusqu'au … ») ;
- voit dans le **dashboard** le ban et **sa durée / date d'expiration** (réutiliser `StatusPill` / `DashboardHero`).
- **Enforcement serveur impératif** : l'UI n'est que cosmétique ; chaque action protégée (rejoindre un live, poster un message) est validée côté serveur/RLS.

## Décisions verrouillées (par le PO — à ne pas rediscuter)

1. **Action automatique immédiate au seuil** (pour l'instant) :
   - message → **supprimé** (soft-delete, jamais de DELETE physique) ;
   - live → **stoppé** ;
   - compte → **banni 24 h**.
   - *Plus tard*, la **gestion/revue** de ces signalements et bans passera par le **panel admin** (cf. roadmap, Chantier 1). → **Dès maintenant, persiste signalements + bans dans un modèle que le panel admin pourra lister, filtrer et override** (statut open/closed/dismissed, sévérité, motif, reporter, cible, contexte, note de revue, émetteur, expiration, réversibilité).
2. **Durée du ban compte = échelle progressive**, basée sur l'historique : **1er → 24 h, 2e → 7 j, 3e → permanent**. Auto-expiration gérée via **`IClock`** (jamais `Date.now()` direct, cf. `CLAUDE.md` §4.1ter).
3. **Anti-abus — pondéré par l'engagement** : un signalement ne **compte dans le quorum** que si le wallet est « réel » :
   - présent sur le live depuis **≥ X minutes**, **OU** ayant **parié** / possédant un **solde** ;
   - **1 signalement par wallet par cible** (dédup) ;
   - **exclure** du décompte le **streamer du live** et les **comptes déjà bannis** ;
   - exiger un **plancher minimum de N signalements distincts** en plus des 25 % (anti-instakill sur faible audience) ;
   - **snapshot** du dénominateur (présents éligibles) au moment du déclenchement, pour audit ;
   - rendre **25 %, N et X configurables** (table de config ou env, pas de magie hardcodée).

## Idées additionnelles (intègre ou écarte chacune, en justifiant)

- **Soft-delete + placeholder** « message retiré par la communauté » dans `ChatMessageItem` (réversible par l'admin plus tard).
- **Message système dans le chat** quand un live est stoppé (réutiliser `LatestSystemBanner` + un nouveau `SystemMessageType`, ex. `STREAM_STOPPED` / `MESSAGE_REMOVED` — l'ajout d'enum requiert ma validation).
- **Kick temps réel** : à la pose du ban, révoquer la session live active du banni (canal Supabase realtime / invalidation) plutôt qu'attendre un refresh.
- **Notifications** : prévenir le streamer dont le live est stoppé et le compte banni (motif + expiration).
- **Audit trail complet** + **idempotence** : contrainte d'unicité `(reporter_wallet, target_type, target_id)` ; table d'actions `report_actions` (qui/quoi/quand/snapshot quorum).
- **Rate-limit & cooldown** des signalements par wallet (anti-spam de signalements).
- **Métriques** Pino/Sentry : volume de signalements, auto-bans déclenchés, ratio de levées (proxy de faux positifs).
- **Garde-fous** : interdire l'auto-signalement ; gérer le cas « signaler le compte = signaler le streamer du live » (ne pas double-compter avec le signalement du live).
- **Posture conformité** (le projet est MiCA-friendly) : une modération de contenu illicite renforce la posture DSA/contenu ; le pari reste **inchangé** — cohérent avec « le banni peut parier ». Mentionne-le en une ligne.
- **Réintégration** : à l'expiration, lever proprement le ban (job + `IClock`) et rétablir l'accès ; prévoir le chemin d'appel/levée manuelle pour le futur panel admin.

## Contraintes `CLAUDE.md` à respecter dans le plan

- **Backend DDD strict** : `domain` pur (entités/value objects/ports), `application` use-cases orchestrant **via ports uniquement**, `infrastructure` adapters (Supabase/viem), `presentation` thin. **Logique pure et testée** dans des policies : p. ex. `ReportQuorumPolicy` (éligibilité + calcul du seuil) et `BanEscalationPolicy` (24 h / 7 j / permanent). **`IClock`** pour tout accès au temps.
- **Front — convention 4 couches obligatoire** pour tout appel backend : **DTO Zod** (`packages/shared/src/dto/...`) → **endpoint** (`apps/frontend/lib/api/endpoints/...`) → **query key** (`lib/query/keys.ts`) → **hook** (`hooks/api/use...`). **Aucun `fetch` brut**, aucun `axios.create` ad-hoc.
- **1 composant = 1 fichier**, limites de taille (§3.3). **Langage visuel rouge Chiliz** (§5), a11y (`aria-label`, `focus-visible`), `prefers-reduced-motion`, pas d'avatar Unsplash.
- **Migration `036`** = nouvelle (jamais éditer une migration mergée) ; prévoir **RLS + grants** cohérents avec `018`/`025`-`027`. **Demander ma validation avant** (changement de schéma, `CLAUDE.md` §9).
- **TS strict, zéro `any`** ; côté front **`BigInt()` et non literals `0n`** (target ES2017, §7.12) ; logs **Pino** structurés ; erreurs via `DomainError`/`ValidationError`/`BusinessRuleError`.
- **Aucune nouvelle dépendance** sans validation (sonner / shadcn / framer-motion déjà dispos).
- **Tests** : fixtures L1, **tests unitaires sur les policies pures**, scénarios L2 si pertinent, intégration L4 sur le chemin critique (cf. §4.1ter).

## Format attendu du plan (structure de ta réponse)

1. **Compréhension & écarts** : ce que tu as vérifié, et toute divergence constatée vs ce prompt.
2. **Modèle de données** : tables `reports`, `bans` (+ `report_actions`/audit si retenu) — colonnes, types, contraintes, index, RLS/grants, contenu de la **migration `036`**. Montre en quoi le schéma est **forward-compatible** avec le panel admin (statuts, sévérité, motif, émetteur, expiration, réversibilité).
3. **Décision d'enforcement chat** (RLS référençant `bans` **vs** re-routage des envois via le backend) : compare, **recommande**, justifie.
4. **Backend** : entités/VO domain, ports, use-cases (p. ex. `CreateReport`, `EvaluateReportThreshold`, `BanAccount`, `LiftExpiredBans`), policies pures (`ReportQuorumPolicy`, `BanEscalationPolicy`), controllers/routes, **middleware `requireNotBanned` (restreint)**, job d'expiration, logs/métriques.
5. **Frontend** : DTO/endpoint/queryKey/hook ; composants (`ReportDialog` réutilisant le shell modale + `sonner`, `ReportButton` sur message/live/profil, `BannedBanner`, gating page live + champ chat, tuile ban du dashboard) ; états dérivés ; realtime.
6. **Découpage en lots** livrables (ordre, dépendances, ce qui est shippable isolément).
7. **Edge cases & sécurité** : sybil/brigading, auto-signalement, streamer, concurrence sur le compteur, idempotence, ré-entrée après expiration, multi-streams par match.
8. **Plan de test** : fixtures L1, unitaires des policies, scénarios L2, intégration L4.
9. **Questions ouvertes / validations requises** : au minimum la **migration `036`**, l'**enforcement chat**, et tout **ajout d'enum** (`SystemMessageType`) ou de dépendance.
10. **Risques & estimation** grossière par lot.

---

**Ne produis aucun code.** Termine en me présentant le plan et la liste des points à valider, puis **attends mon GO**.
