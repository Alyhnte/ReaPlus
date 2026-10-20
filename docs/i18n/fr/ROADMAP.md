# FEUILLE DE ROUTE — Feuille de route ReaPlus

> État : v0.13.0 publiée (npm + MCP Registry + CI au vert). Ce document est né des
> constats de la première revue du 2026-10-12, et a été synchronisé avec le réalisé à la fin
> de chaque vague. v0.13.0 a clos l'identité de machine PE (ARMNT/ARM64),
> ELF e_machine + Hexagon, les valeurs plist sans perte typées, la résolution JS
> CJS/require + les relations cross-bundle, l'observation de version apktool
> (advisory), le profil Ghidra raw m68k et la synchronisation des porteurs de
> version (9 contrôles). La surface d'outils est inchangée (191 outils). Les nombres
> proviennent de la surface réelle du serveur compilé (sortie de production de [`TOOLS.md`](TOOLS.md)).
>
> **Mesures :** Impact = contribution à la valeur utilisateur/agent · Effort = S (jours) / M (1-2 semaines) / L (mois+)
> · Priorité = P0 (porte extérieure) → P3 (long terme).

## Clos sur la base v0.10.0 (résumé)

- Surface MCP : 191 outils + 2 resources + 7 prompts ; référence complète générée dans [`TOOLS.md`](TOOLS.md).
- Profils `REA_TOOLSETS` : `all` 191 (par défaut), `minimal` 8, `static` 98, `android` 27, `dotnet` 20, `web` 26, `debug` 50 ; union avec virgules, profil inconnu = erreur au démarrage. Nouvel outil uniquement dans `all` (fail-closed).
- `REA_WORKSPACE_ROOT` : chemins `rea_*` + conduit + écritures dérivées visibles par l'utilisateur à l'intérieur de la racine ; surfaces temp/cache de l'opérateur en exception assumée. Roots (legacy + moderne MRTR) ne fait que restreindre.
- HTTP sans token : allowlist de 44 outils en lecture seule (intersection avec le toolset) + `REA_AUDIT_LOG` (JSONL sans arguments) + limite de débit (120/min) + plafond de concurrence (16) + TTL de session (30 min).
- Base de types : 187 `outputSchema`, 191 annotations (zéro non annoté ; 4 outils durablement sans schéma).
- Jobs async (5 outils, surface 177→192) + file de sessions FIFO + sérialisation complète + cache worker + généralisation de la progression.
- Robustesse des moteurs : timeouts d'installation Frida, pause async + push cdb, provisionnement x64dbg, correctif jadx `-cp` + acceptation d'APK réelle.
- Honnêteté statique : scénario navigateur, FLIRT, Wasm/DWARF, PE/PDB, Mach-O, IL2CPP/Go/Flutter, diff binaire, PCAP/TLS, recette Android.
- Installation : assistant `setup` + `doctor --fix` ; manifestes (winget/scoop/brew) + SBOM + recette sandbox ; faisabilité SEA.
- Qualité : manifeste du corpus golden, fuzz smoke (CI), e2e par défaut, budgets perf + schéma, site docs + bibliothèque de prompts.
- Publication : `rea-plus@0.10.0` sur npm, `io.github.Alyhnte/rea-plus` sur le MCP Registry, chaîne de tags (npm→attente→registry) à déclencheur unique. **La validation Frida sur VM réelle reste une porte ouverte** (non fermée ci-dessous).

## Clos avec 0.7.2 + 0.7.3 (résumé)

- `npm start`/`npm test` cassés, incohérence de version, assets runtime non copiés vers dist : corrigés.
- Enveloppe d'erreurs (`isError`), porte d'injection d'adresses, outils renvoyant un faux `ok`, timeouts/demi-sessions Frida, écritures croisées de checkpoints : corrigés.
- Suite de tests par défaut au vert hors machine de l'auteur (fixtures portables, portes d'outils honnêtes, zéro chemin personnel) ; CI Ubuntu Node 20+22 au vert.
- Installation : installation git via `prepare`, connexions Cursor/VS Code en un clic, Dockerfile + workflow GHCR, exemples de config client.

## A) Distribution et installation

| Proposition | État actuel / écart | Impact | Effort | Priorité |
|---|---|---|---|---|
| ✅ Publication sur npm (`rea-plus`) | CLOS (v0.8.0, chaîne v0.9.0+) : `rea-plus@0.10.0` au registre ; chaîne de tags (npm→attente→registry, déclencheur unique) | Installation en une commande : `npx -y rea-plus` | S | — |
| ✅ Enregistrement au MCP Registry (`mcp-publisher`) | CLOS (v0.8.0, chaîne v0.9.0+) : `io.github.Alyhnte/rea-plus` publié | Découvrabilité dans le catalogue officiel | S | — |
| ✅ Pousser l'image GHCR dès la première release | CLOS (v0.7.4) : tags publiés pour `ghcr.io/alyhnte/reaplus` et tirage anonyme vérifié | Zéro installation pour les utilisateurs Docker | S | — |
| ✅ Assistant `rea-plus-cli setup` | CLOS (v0.10.0) : détection de clients + écriture sur confirmation + `.bak` + dry-run ; testé uniquement dans un HOME temporaire | Élimine la plus grande friction | M | — |
| ✅ `doctor --fix` | CLOS (v0.10.0) : suggestion d'installation sous confirmation (winget/brew/apt) ; ne s'exécute jamais sans confirmation | Une seule commande quand un outil manque | M | — |
| ◐ Exe Windows en un seul fichier (Node SEA) | FAISABILITÉ TERMINÉE (v0.10.0) : SEA hello-world fonctionnel ; application complète bloquée par 3 obstacles (binding Frida de 129 Mo, playwright dynamique, signature) — alternative : bundle node portable | Distribution sans Node ; asset de release | M | P2 |
| ✅ Manifestes winget/scoop/homebrew | CLOS (v0.10.0) : trois manifestes versionnés + hachés ; aucune soumission en magasin effectuée | Découverte via gestionnaires de paquets | S | — |
| ◐ Release signée + SBOM | PARTIEL (v0.10.0) : SBOM (CycloneDX) produit ; pas de signature ni de provenance/Trusted Publisher | Confiance de la chaîne d'approvisionnement | S | P2 |

## B) Protocole MCP et expérience agent

| Proposition | État actuel / écart | Impact | Effort | Priorité |
|---|---|---|---|---|
| ✅ Profils de toolsets (`REA_TOOLSETS=static,debug`) | CLOS : `all` 191, `minimal` 8, `static` 98, `android` 27, `dotnet` 20, `web` 26, `debug` 50 ; union avec virgules, profil inconnu = erreur au démarrage, resources/prompts non filtrés | Contexte de liste d'outils réduit, précision accrue | S | — |
| ✅ Resources | CLOS : 2 resources statiques en lecture seule (`rea-plus://server-info`, `rea-plus://capabilities-safety`) ; aucun fichier/env arbitraire ouvert, pas d'abonnement | Identité du serveur + règles de sécurité lisibles via URI | M | — |
| ✅ Prompts | CLOS : 3 prompts sans effets secondaires (`packer-triage`, `dotnet-malware-triage`, `android-triage`) ; un prompt n'exécute aucun outil, renvoie uniquement du texte de flux ordonné | Flux de triage prêts en un seul choix | S | — |
| ✅ `outputSchema` + `structuredContent` | CLOS (v0.10.0) : 187 outils avec `outputSchema` (4 durablement sans schéma) ; sur résultats objet plats, `structuredContent` identique au JSON textuel — état par outil dans [`TOOLS.md`](TOOLS.md) | Consommation type-safe | M | — |
| ✅ Notifications de progression + annulation | CLOS (v0.10.0) : helpers de stages + 3 outils étagés ; handlers synchrones hors périmètre (documenté) | L'agent voit la progression, peut abandonner | M | — |
| ✅ Annotations d'outils | CLOS (v0.10.0) : 191 annotations (zéro non annoté) | UX de confirmation côté client | S | — |
| ✅ Modèle de jobs async (démarrer → interroger) | CLOS (v0.10.0) : 5 outils de jobs (surface 192) ; whitelist de 3 ; l'annulation tue l'arbre de processus | Les tâches longues sont interrogées sans blocage | M | — |
| ✅ Prise en charge de Roots | CLOS (v0.10.0) : legacy + moderne MRTR ; le workspace ne s'élargit sur aucun chemin | L'espace de travail se restreint automatiquement | S | — |
| ✅ File de sessions + sérialisation | CLOS (v0.10.0) : FIFO-32 + `REA_SESSION_SERIALIZE` (prouvé par horodatage), timeout+annulation préservés | Fin des courses critiques | M | — |

## C) Sécurité

| Proposition | État actuel / écart | Impact | Effort | Priorité |
|---|---|---|---|---|
| ✅ Contrainte de racine de travail (`REA_WORKSPACE_ROOT`) | CLOS : chemins `rea_*` + conduit + écritures dérivées vérifiés par realpath à l'intérieur de la racine ; temp/cache opérateur en exception | La surface de prompt-injection se referme | M | — |
| ✅ Mode lecture seule en HTTP sans token | CLOS : sans token, allowlist de 44 outils ; intersection avec le toolset | Un port ouvert devient inoffensif | S | — |
| ✅ Journal d'audit (JSONL) | CLOS : par ligne `ts`/`transport`/`tool`/`durationMs`/`isError` ; aucun secret écrit | Examen d'incidents | S | — |
| ✅ Limite de débit + concurrence + TTL de session | CLOS : 120/min + 16 simultanées + TTL 30 min ; valeur invalide = erreur au démarrage | Robustesse + hygiène | S | — |
| ✅ Recette sandbox (document de profil VM) | CLOS (v0.10.0) : `docs/SANDBOX.md` (Hyper-V + VirtualBox, snapshot + restauration) | Environnement isolé prêt | S | — |

## D) Moteurs de débogage

| Proposition | État actuel / écart | Impact | Effort | Priorité |
|---|---|---|---|---|
| ✅ File de sessions + sérialisation | CLOS (v0.10.0) : FIFO-32 + mode série complet ; timeout+annulation préservés | Fin des courses critiques | M | — |
| ◐ Vrai rapport d'exceptions dans l'agent Frida | CODE + VERROU TERMINÉS, PORTE LIVE OUVERTE : `false` hors slot, timeouts d'installation ; pas de validation Frida sur VM réelle | Les vrais plantages deviennent visibles | S | **P0** (VM réelle) |
| ✅ Timeouts attach/createScript/load de Frida | CLOS (v0.10.0) : 15/10/15 s + override par env + `engine_timeout` avec nettoyage | Fin des blocages | S | — |
| ✅ cdb : pause async + vrais événements push | CLOS (v0.10.0) : boucle d'événements non bloquée, push aux abonnés | Confort multi-sessions | M | — |
| ✅ Auto-provisionnement du plugin x64dbg | CLOS (v0.10.0) : doctor + setup, idempotent + vérifié par hash | La friction d'installation disparaît | M | — |
| Moteur LLDB (Linux/macOS) | Débogage live uniquement sous Windows | Couverture de plateformes élargie | L | P3 |
| Lecture des enregistrements TTD de WinDbg | Absent | Analyse de voyage temporel | L | P3 |

## E) Domaines statiques (profondeur et honnêteté)

| Proposition | État actuel / écart | Impact | Effort | Priorité |
|---|---|---|---|---|
| ✅ Vrais champs manifeste/classes de jadx | CLOS (v0.10.0) : correctif `-cp` + vrai APK individuel + balayage de découverte POSIX | Sortie Android fiable | S | — |
| ✅ Scénario navigateur | CLOS (v0.10.0) : les étapes s'exécutent vraiment + preuves + dry-run | Fonctionne comme son nom l'indique | M | — |
| ✅ Honnêteté FLIRT | CLOS (v0.10.0) : `string-heuristic` + score de confiance | Confiance | S | — |
| ✅ Wasm/DWARF | CLOS (v0.10.0) : LEB multi-octets + v5/abbrev_offset | Vrai résumé | S/M | — |
| ✅ PE + PDB | CLOS (v0.10.0) : vrai en-tête + téléchargement + cache | Noms corrects + symboles | S/M | — |
| ✅ Mach-O/iOS | CLOS (v0.10.0) : TS pur + fat + liste ObjC | Cibles Apple | M | — |
| ✅ IL2CPP/Go/Flutter | CLOS (v0.10.0) : comptage + mise en correspondance + snapshot ; branche honnête quand l'outil manque | Profondeur RE | L | — |
| ✅ Diff binaire | CLOS (v0.10.0) : ajoutés/supprimés/modifiés + streaming | Analyse de correctifs | M | — |
| ◐ Vrai pont Hopper | RECHERCHE TERMINÉE : pas d'API headless (de source officielle) → honnête en préparation de requêtes ; porte de similarité POSIX ajoutée | Données réelles quand licencié | L | P3 |

## F) Comportement et analyse dynamique

| Proposition | État actuel / écart | Impact | Effort | Priorité |
|---|---|---|---|---|
| ✅ Matrice de syscalls + profils CreateFileW/RegSet | CLOS (v0.10.0) : mise en correspondance des numéros ntdll + profils d'accès | Rapport approfondi | S | — |
| ✅ Exécution comportementale en un seul appel | CLOS (v0.10.0) : spawn+trace+capture, timeout obligatoire, honnêteté sur crash | Profil en un seul appel | M | — |
| ✅ PCAP + keylog TLS | CLOS (v0.10.0) : réassemblage de flux + déchiffrement par keylog ; non déchiffrable → `sifreli` | Le trafic C2 devient lisible | M | — |
| ✅ Recette dynamique Android | CLOS (v0.10.0) : production en 5 étapes + validation à sec ; outils manquants signalés | Démarrage mobile | M | — |
| Exécution symbolique (angr/Triton, WSL) | Absent | Seule voie réelle face à la classe VMProtect | L | P3 |
| Harnais de fuzzing (AFL++ WSL) | Absent | Trouver des plantages dans les analyseurs cibles | L | P3 |

## G) Échelle et performances

| Proposition | État actuel / écart | Impact | Effort | Priorité |
|---|---|---|---|---|
| ✅ Rattachement live du cache worker | CLOS (v0.10.0) : chemin reposcan prouvé par compteur | Répétitions rapides | M | — |
| ✅ Nettoyage de la façade morte (`probeCache`/`parallelProbe`) | CLOS (v0.10.1) : comportement déplacé vers `workerCache` (`ResultCache` TTL + `runProbes`) ; `probe.test.mjs` déplacé sous `worker-cache.test.mjs` | Le code mort disparaît | S | — |
| ✅ Analyse parallèle (pool de 4) | CLOS (v0.10.0) : fusion ordonnée + annulation + isolation des erreurs | Intégration CI | M | — |
| ✅ Budget de schéma | CLOS (v0.10.0) : seuils mesurés (200 Ko/110 Ko/600 o) | Fin du gonflement | S | — |
| Application du budget de schéma en CI | Test présent, étape CI absente | Le budget casse en CI | S | P2 |
| ✅ Lecture en streaming | CLOS (v0.10.0) : tampon 64 Ko + arrêt sur annulation | Fin des OOM | M | — |

## H) Tests et qualité

| Proposition | État actuel / écart | Impact | Effort | Priorité |
|---|---|---|---|---|
| ✅ Manifeste du corpus golden | CLOS (v0.10.1) : `tests/corpus/mini.dex` (DEX minimal synthétique v035, production déterministe `scripts/dex-fixture-uret.mjs`) + 7 tests `dex-golden` + entrée HASHES | Les régressions sont attrapées tôt | M | — |
| Runner Windows auto-hébergé | Les tests Frida/debug ne tournent pas en CI | La surface la plus risquée vérifiée en continu | M | P0 |
| ✅ Fuzz des analyseurs en smoke CI | CLOS (v0.10.0) : mutation déterministe, crash/hang=0 | Les classes silencieuses sont attrapées | M | — |
| ✅ e2e HTTP dans la suite par défaut | CLOS (v0.10.0) : sorti de LIVE, aucun flake | La régression transport devient visible | S | — |
| ✅ Budgets de performances | CLOS (v0.10.0) : seuils mesurés, méthode médiane | Fin de l'accumulation | S | — |

## I) Documentation et communauté

| Proposition | État actuel / écart | Impact | Effort | Priorité |
|---|---|---|---|---|
| ✅ Référence d'outils automatique | CLOS (v0.10.0) : [`TOOLS.md`](TOOLS.md) depuis la surface réelle (191 outils + 2 resources + 3 prompts) | Catalogue à jour | S | — |
| Sessions d'exemple (asciinema/GIF) dans le README | Aucune preuve visuelle | Conviction en 10 premières secondes (conversion en étoiles) | S | P1 |
| ◐ Site docs | PRODUIT (v0.10.0) : 7 pages statiques + 0 lien cassé | Documentation cherchable | M | P2 |
| Déploiement Pages (site prêt, non publié) | `docs/site/` produit mais non branché à GitHub Pages | Documentation sur une URL unique | S | P2 |
| ✅ Bibliothèque de prompts | CLOS (v0.10.0) : `docs/PROMPTS.md` (10 prompts, avec exemples d'appels) | Première valeur en quelques minutes | S | — |
| good-first-issue + élargissement de CONTRIBUTING | Un seul paragraphe | Le tunnel de contribution s'ouvre | S | P3 |

---

**Ordre suggéré (restes ouverts) :** VM live Frida → runner → trusted publisher → sessions d'exemple → déploiement Pages → recherche P3.
Clos en v0.10.1 : nettoyage de la façade morte + corpus DEX golden (✅ ci-dessus) ; clos en v0.10.0 : l'intégralité des vagues I/J/K.
