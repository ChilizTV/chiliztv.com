# Prompt — Ouvrir l'accès public (retirer le gate waitlist/access-code)

> Contexte : l'app passe en accès public aujourd'hui. On **désactive** le gating, on ne supprime
> pas le code backend waitlist/access (réversible). Lis `CLAUDE.md` avant de commencer.

## Objectif

1. Sur la landing (`apps/landing`), remplacer le widget waitlist/access-code (`GateInline`) par un CTA **"Launch App"** qui envoie vers l'app.
2. Dans l'app (`apps/frontend`), supprimer la redirection vers la landing pour les visiteurs sans cookie `cwk_access` — tout le monde entre directement.

## État actuel (vérifié)

- `apps/frontend/proxy.ts` redirige vers `LANDING_URL` si le cookie `cwk_access` est absent, avec un toggle `NEXT_PUBLIC_ACCESS_GATE_DISABLED`. Vérifie comment ce fichier est branché (middleware Next) avant de le modifier.
- `GateInline` (tabs "Join waitlist" / "I have a code") est rendu à 4 endroits :
  - `apps/landing/components/HeroSection.tsx` (l.60)
  - `apps/landing/components/landing/FinalCTA.tsx` (l.32)
  - `apps/landing/components/features/how-it-works/sections/EndCTA.tsx` (l.34)
  - `apps/frontend/components/features/how-it-works/sections/EndCTA.tsx` (l.34) — copie côté app
- L'URL de l'app côté landing : `process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"` (cf. `GateInline.tsx`), cible `/browse`.

## Travail demandé

### Lot 1 — CTA "Launch App" (landing)

- Créer **un composant dédié** `apps/landing/components/features/access/LaunchAppCta.tsx` (règle : un composant = un fichier). Prop `centered?: boolean` comme `GateInline`.
- Un `<a href={`${APP_URL}/browse`}>` stylé CTA primaire selon le langage visuel du `CLAUDE.md` :
  `rounded-md bg-[#E8001D] px-7 py-4 text-[14px] font-bold uppercase tracking-[0.06em] text-white hover:-translate-y-px hover:bg-[#FF1737]` + `boxShadow: "0 8px 32px rgba(232,0,29,0.25)"`. Label : **Launch App**.
- Remplacer `<GateInline />` par `<LaunchAppCta />` dans les 3 call-sites landing. Ne pas supprimer les fichiers `GateInline.tsx` ni les hooks waitlist/access (on garde le code, juste plus référencé).
- Adapter la copy qui mentionne la waitlist :
  - `FinalCTA.tsx` : « Join the waitlist or enter your access code to get in. » → ex. « The app is live — jump in and take your side. »
  - `apps/landing/components/features/how-it-works/sections/EndCTA.tsx` : même phrase, même traitement.

### Lot 2 — EndCTA côté app (`apps/frontend`)

- Dans `apps/frontend/components/features/how-it-works/sections/EndCTA.tsx`, remplacer `<GateInline />` par un CTA interne (`next/link`) vers `/browse`, même style, label **Launch App** ou **Browse matches**. Même mise à jour de copy.

### Lot 3 — Supprimer le gate (`apps/frontend/proxy.ts`)

- Retirer le check cookie `cwk_access` et la redirection vers `LANDING_URL`, ainsi que le toggle `ACCESS_GATE_DISABLED` devenu inutile.
- Si le proxy ne fait plus rien d'utile, supprime-le proprement (fichier + branchement middleware + matcher). Sinon, laisse-le en passthrough minimal.
- Si `NEXT_PUBLIC_ACCESS_GATE_DISABLED` ou `LANDING_URL` figurent dans les `.env.example` / `.env.local.example` : **demande confirmation avant de les modifier** (règle CLAUDE.md §9), et bumpe les deux fichiers ensemble si validé.

## Hors scope — ne pas toucher

- Routes/use-cases backend `waitlist` et `access` (restent en place).
- DTOs `packages/shared` waitlist/access.
- Le cookie `cwk_access` côté backend (`access.controller.ts`).

## Vérifications avant commit

- `grep -ri "join waitlist" apps/` → plus aucune occurrence UI (hors code backend/GateInline non référencé).
- `grep -r "GateInline" apps/landing/components apps/frontend/components` → plus aucun import dans les pages/sections.
- Build TS vert sur `apps/landing` et `apps/frontend` ; aucun import non utilisé.
- Test manuel : ouvrir l'app sans cookie `cwk_access` → pas de redirection vers la landing ; clic "Launch App" sur la landing → arrive sur `/browse`.
- Commit : `feat: open public access — replace waitlist gate with Launch App CTA`.
