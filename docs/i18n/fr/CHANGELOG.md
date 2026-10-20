# Changelog — rea-plus

Tous les changements notables sont consignés dans ce fichier. Format : Keep a Changelog + SemVer.
All notable changes are documented here (résumé en français + détail en anglais).

## [0.13.0] — 2026-10-20

Version 0.13.0 : dalga-13 + dalga-14 — identité de machine au sniff (PE
ARMNT/ARM64, ELF e_machine + Hexagon), valeurs plist sans perte typées,
résolution JS CJS/require + relations cross-bundle, observation de version
apktool (advisory), profil Ghidra raw m68k et synchronisation des porteurs de
version (9 contrôles). Surface d'outils inchangée (191 outils · 187
outputSchema · 2 resources · 7 prompts, 6 langues). 107/107 tests verts.

### Ajouté / Added

- `rea_sniff` : le champ PE `makine` remonte ARMNT (`0x01c4`) et ARM64
  (`0xaa64`) ; x86/x64 et legacy ARM/Thumb/ARM64EC volontairement hors
  périmètre. ELF `e_machine` (LE/BE, ≥20B) est mappé sur 14 noms, dont
  Hexagon (164).
- `rea_apple_plist` : lecture sans perte typée (chaînes brutes integer/real
  conservées, entités XML décodées) + `details.anahtarTipleri`.
- `rea_js_require` / `rea_js_export_shape` : résolution relative +
  node_modules, forme d'export CJS ; `rea_js_bundle_diff` avec `mapA`/`mapB`
  optionnels ajoute `details.iliskiler {paylasilanKaynaklar, yalnizA,
  yalnizB}` (déterministe).
- `rea_apktool_info` / `rea_apktool_caps` : `surumGozlem {ham, sayisal?}`
  optionnel — observation seulement, pas une preuve ; absent si la ligne
  n'est pas analysable.
- Profil de langage Ghidra raw m68k (`GhidraRawProfil`, module pur hors
  surface).

### Corrigé / Fixed

- Garde CLI `analyze-js` répertoire-vs-fichier : un répertoire n'est plus pris
  pour `index.js` et parcouru silencieusement ; erreur claire + code de sortie.
- Porteurs de version : README, i18n, site, CHANGELOG et manifestes dist sont
  couverts par version-sync (9 contrôles) ; valeurs obsolètes
  0.8.2/0.9.0/0.10.1 supprimées.
- Lignes de statut README/TOOLS/ROADMAP passées à v0.13.0 en 6 langues ;
  entrées historiques volontairement intactes.

### Interne

- Vagues 13–14 en worktrees isolés + TDD ; 4/4 branches fusionnées ; suite
  complète 107/107.

## [0.12.0] — 2026-10-18

Version 0.12.0 : dalga-11 — 4 prompts de modèles de tâches (3 → 7) +
corpus golden (5 binaires gcc réels) + portable node bundle + correctif
realpath du garde CLI + sync docs/site/tool-reference (191 outils ·
187 outputSchema · 191 annotations · 2 ressources · 7 prompts, 6 langues).
103/103 tests verts.

### Ajouté / Added

- 4 prompts de modèles de tâches : `packer-triage`,
  `dotnet-malware-triage`, `android-triage`, `pe-crash-triage`
  (7 prompts au total ; `docs/PROMPTS.md` avec 10 sections numérotées,
  chacune avec objectif + appel exemple + sortie attendue).
- Corpus golden : 5 binaires gcc réels (PE32+/DLL/COFF obj) +
  `tests/corpus/HASHES.json` + script de reconstruction déterministe +
  16 nouveaux tests sdk-surface (fs 14, scan_repo 10/pe5).
- Portable node bundle : `scripts/portable-paketle.mjs` (distribution
  sans Node ; fermeture des deps de prod, frida binding transporté en
  fichier, MANIFEST + fumée) + 7 tests ; `publish.yml` release-artifacts
  téléverse le zip portable en asset de release GitHub (bundle linux ;
  CI ubuntu).
- Correctif realpath du garde CLI de `generate-tool-reference.mjs` :
  junction vs chemin réel n'est plus un no-op silencieux (exit 0, aucune
  sortie) + `tests/generate-tool-reference-cli.test.mjs`.

### Corrigé / Fixed

- Lignes de résumé courantes : « 7 prompts » en 6 langues
  (TR/EN/DE/FR/ES + racine) : README, EXAMPLES, PROMPTS, ROADMAP ;
  lignes historiques v0.10.0/CERRADO volontairement inchangées (vraies
  à l'époque).
- TOOLS.md re-aligné sur la surface réelle (191/2/7) + régénération du
  site (5 langues × 7 pages).

## [0.11.0] — 2026-10-18

Version 0.11.0 : site i18n 5 langues + thème premium + sessions
d'exemple + provenance de publication. Surface d'outils inchangée
(191 outils + 2 ressources + 3 prompts). 101/101 tests par défaut verts.

### Ajouté / Added

- Site 5 langues (TR/EN/DE/FR/ES) : `scripts/site-uret.mjs` avec chrome
  i18n + sélecteur de langue ; 5 langues × 7 pages = 35 HTML.
- Thème de site premium (scroll-reveal + bascule clair/sombre).
- Sessions d'exemple (README "🎬 Örnek Oturumlar" +
  `docs/ornek-oturumlar/` : ghidra / ida / r2 — preuves de sorties
  réelles, rien d'inventé).
- Provenance de publication npm (OIDC `--provenance`) + job
  `release-artifacts` : le SBOM CycloneDX devient une pièce jointe
  automatique de la release GitHub.
- CONTRIBUTING découpé en 6 sections H2 + formulaires d'issues
  `bug-raporu` / `ozellik-istegi` (schéma GitHub issue form).
- Mode `site-uret.mjs --check` : validation présence/taille/langue
  des 35 pages, `exit(1)` sur fichier corrompu.

### Interne

- Vagues 6 à 10 construites en worktrees isolés avec TDD ; la suite
  complète est verte à la porte.

## [0.10.2] — 2026-10-16

Version 0.10.2 : vagues distribution/qualité P2 + profondeur Mach-O + notes de
recherche P3. Surface d'outils inchangée (191 outils + 2 resources +
3 prompts). 96/96 tests par défaut au vert.

### Ajouté / Added

- Workflow de déploiement Pages (`pages.yml` : push sur main → génération du site → déploiement).
- Étape CI du budget de schéma (200 Ko de liste / 110 Ko de schéma / 600 o en moyenne).
- Harnais de fuzz ciblé (`scripts/fuzz-harness.mjs` : classification + rapport
  + `docs/FUZZ.md` ; première exécution : 0 crash).
- Bundle node portable (`scripts/sea-portable.mjs` + `docs/SEA-DAGITIM.md` ;
  pas de SEA mono-exe à cause de 3 obstacles).
- Notes de faisabilité P3 (`docs/ARASTIRMA-*` : LLDB/TTD/angr EN ATTENTE, commercial NE PAS FAIRE).
- Tunnel de contribution (CONTRIBUTING élargi + formulaire good-first-issue).

### Corrigé / Fixed

- Résolution de tranches fat binaries de `rea_macho_objc` (paramètre `arch` + échelle
  d'honnêteté) ; mode limité conservé car IL2CPP v31+ non vérifiable hors ligne.
- Synchro ROADMAP v0.10.1 (clôtures P1 traitées).

## [0.10.1] — 2026-10-16

Version 0.10.1 : points de code P1 clos — nettoyage de la façade morte +
fixture DEX golden. Surface d'outils inchangée (191 outils + 2 resources +
3 prompts). 92/92 tests par défaut au vert.

### Corrigé / Fixed

- Façade morte supprimée : comportement `probeCache`/`parallelProbe`
  déplacé vers `workerCache` (`ResultCache` TTL + `runProbes`) ;
  `tests/probe.test.mjs` déplacé sous `worker-cache.test.mjs`.
- Fixture DEX golden : `tests/corpus/mini.dex` (DEX minimal synthétique
  v035, production déterministe `scripts/dex-fixture-uret.mjs`) +
  7 tests `dex-golden` + entrée HASHES.
- Mappage `RepoScan` `.dex → dex/jadx` ajouté.

## [0.10.0] — 2026-10-16

Version 0.10.0 : 4 nouveaux outils (187→191), file de sérialisation, rattachement
du worker-cache, préparation de distribution (faisabilité SEA, manifestes, SBOM, sandbox),
qualité durable (budget de schéma, site docs, bibliothèque de prompts, profondeur
ObjC/IL2CPP/Go). 187 `outputSchema`, 191 annotations. 91/91 tests par défaut au vert.

### Ajouté / Added

- `rea_macho_objc/classdump`, `rea_il2cpp_methods`, `rea_go_buildinfo`.
- Sérialisation complète (`REA_SESSION_SERIALIZE=1`, prouvée par horodatage).
- Rattachement live du worker-cache (chemin reposcan, prouvé par compteur).
- Rapport de faisabilité SEA + script pilote ; manifestes winget/scoop/homebrew.
- SBOM (CycloneDX) + `docs/SANDBOX.md` (Hyper-V/VirtualBox).
- Budget de schéma (seuils mesurés), site docs (7 pages), `docs/PROMPTS.md`.

### Corrigé / Fixed

- Découverte jadx POSIX (balayage PATH + X_OK).
- Porte de similarité Hopper POSIX.
- Compatibilité cdb-async avec le CI Linux ; normalisation du corpus.

### Pas encore fait / Not yet done

- Validation Frida sur VM réelle ; runner Windows auto-hébergé.
- Suppression de la façade morte (dépendance du test probe) ; recherche P3.

## [0.9.0] — 2026-10-15

Version 0.9.0 : surface par défaut portée de 172→187 avec 15 nouveaux outils (30 conduit + 157 rea),
183 `outputSchema` + 187 annotations conservés, facilité d'installation (`setup`
assistant, `doctor --fix`) et plateforme qualité (fuzz smoke des analyseurs, e2e HTTP
par défaut, budgets de performances, sessions d'exemple + CONTRIBUTING). 86/86 tests
par défaut au vert.

### Ajouté / Added

- 15 nouveaux outils (172→187) : `rea_go_funclines`, `rea_go_goresym`,
  `rea_il2cpp_metadata`, `rea_il2cpp_dump`, `rea_bindiff_fonksiyonlar`,
  `rea_bindiff_karsilastir`, `rea_flutter_snapshot`, `rea_flutter_blutter`,
  `rea_macho_info`, `rea_macho_loads`, `rea_macho_otool`, `rea_pcap_oku`,
  `rea_scan_repo_paralel`, `rea_android_dinamik_recete`,
  `rea_android_recete_dogrula`.
- Assistant `rea-plus-cli setup` (détection de clients + écriture de config) et
  `doctor --fix` (suggestion/exécution d'installation sur confirmation).
- Fuzz smoke des analyseurs (`scripts/fuzz-parsers.mjs` + `parser-fuzz.test.mjs` ;
  graines issues du corpus en lecture seule, écriture limitée à tmpdir).
- e2e HTTP intégré au couloir par défaut (`tests/e2e.http.mjs`).
- Budgets de performances (`perf-budget.test.mjs` : tools/list + démarrage).
- Sessions d'exemple (`docs/EXAMPLES.md` + `docs-examples.test.mjs`) et
  `CONTRIBUTING.md` (règles du corpus incluses).

### Corrigé / Fixed

- Porte de similarité Hopper POSIX : un faux fichier ne ressemblant pas à un exécutable par bit/taille
  ne compte plus comme Hopper, `capability_unsupported` honnête renvoyé.
- Branche cdb async du CI Linux et normalisation des fins de ligne du corpus (correctifs venus de 0.8.2)
  verrouillés par des tests de non-régression sur la surface à 187 outils.

### Pas encore fait / Not yet done

- Validation Frida sur VM réelle ; runner Windows auto-hébergé.
- Exe Windows en un seul fichier (Node SEA) ; manifestes winget/scoop/homebrew ; SBOM.
- Recherche P3 : moteur LLDB, TTD WinDbg, exécution symbolique (angr/Triton).

## [0.8.2] — 2026-10-15

Version 0.8.2 : couverture de schémas restante close (168 `outputSchema`, 172 annotations,
zéro non annoté), téléchargeur PDB enregistré comme 172e outil, TTL de sessions et
Roots moderne MRTR arrivés, généralisation de la progression + whitelist async portée à 3.
Surface par défaut de 172 outils ; opt-in : async +5 (177), file +1 (173). 72/72
tests par défaut au vert (CI incluse).

### Ajouté / Added

- 20 conduit + `rea_pdb_indir` en `outputSchema` (total 168) ; annotations 172/172.
- Enregistrement de `rea_pdb_indir` (serveur de symboles Microsoft, avec intégrité, avec cache, uniquement dans le profil `all`).
- TTL de sessions (`REA_SESSION_TTL_MS`, 30 min par défaut, 0=désactivé).
- Roots moderne MRTR (`inputRequired`/`inputResponses`) ; `list_changed` côté legacy.
- Helpers de stages de progression sur 2 outils de plus ; whitelist async à 3.

### Corrigé / Fixed

- Compatibilité du test cdb-async avec le CI Linux (branche `engine_unavailable` acceptée).
- Normalisation des fins de ligne pour les hashs du corpus ; correctif HASHES de `ornek.js`.

### Pas encore fait / Not yet done

- Validation Frida sur VM réelle ; runner Windows auto-hébergé ; corpus DEX durable.
- Facilité de distribution P2 ; profondeur d'analyse ; recherche P3.

## [0.8.1] — 2026-10-14

Version 0.8.1 : robustesse des moteurs (file de sessions, timeouts Frida, cdb async, provisionnement
x64dbg), honnêteté statique (scénario navigateur, FLIRT, Wasm/DWARF, PE/PDB),
comportement et échelle (matrice de syscalls, exécution en un seul appel, cache worker), plateforme de tests
durable (corpus golden, 147 outputSchema, généralisation de la progression). Surface par
défaut conservée à 171 outils ; toutes les nouveautés sont opt-in ou des
améliorations d'erreurs honnêtes. 70/70 tests par défaut au vert.

### Ajouté / Added

- File de sessions FIFO (`REA_SESSION_QUEUE=1` opt-in, profondeur 32, outil `session_queue_status` ; surface 171 par défaut inchangée).
- Timeouts d'installation Frida (attach 15 s/script 10 s/load 15 s, avec override par env, `engine_timeout` avec nettoyage unload/detach au timeout).
- Pause async + événements push de cdb (boucle d'événements non bloquée, `pauseAsync` opt-in).
- Provisionnement x64dbg (`reaX64dbgDoctor` + `reaX64dbgSetup`, idempotent, vérifié par hash).
- Exécution réelle du scénario navigateur (avec preuves d'étapes, mode dry-run, `capability_unsupported` sans backends).
- Matrice de numéros de syscalls + profils CreateFileW/RegSet.
- Exécution comportementale en un seul appel (`BehaviorRun` : spawn+trace+capture, timeout obligatoire, honnêteté sur crash).
- Cache worker (LRU-100, clé par hash, bypass `REA_CACHE=0`).
- Manifeste du corpus golden (`tests/corpus/HASHES.json` + `verify-corpus.mjs`).
- Helpers de généralisation de la progression (`createStageProgress`, `onAbort`).
- 27 nouveaux `outputSchema` (total 147 : 137 rea + 10 conduit).

### Corrigé / Fixed

- Blocage jadx `-jar` : converti au format `-cp jadx.cli.JadxCLI` ; acceptation APK réelle passée (`com.zb.test`, 7 permissions, 5 classes, 2,2 s).
- Fausse dénomination FLIRT : la description et le résultat portent `string-heuristic` + score de confiance.
- WasmInfo LEB multi-octets + DWARF v5/abbrev_offset/FORM multiples (fini les tailles négatives et les faux résumés vides).
- PE `SizeOfOptionalHeader` + code dupliqué PeReader/PdbReader fusionné ; téléchargement PDB (avec cache, avec intégrité).

### Pas encore fait / Not yet done

- Validation Frida sur VM réelle ; corpus DEX durable (fixture dans le dépôt) ; runner Windows auto-hébergé.
- 24 outils restants sans schéma ; généralisation de la progression (handlers synchrones) ; OIDC trusted publisher + provenance.

## [0.8.0] — 2026-10-14

Version 0.8.0 : surface du protocole MCP élargie (resources/prompts, toolsets, sorties
typées), nouvelles frontières de sécurité (racine workspace, HTTP sans token, audit),
pilotes async jobs + progression pour les tâches longues. Ce qui suit décrit l'état
de cette version ; les portes extérieures de la section « Pas encore fait » restent ouvertes.
Release 0.8.0: bigger MCP surface, new security boundaries, async job and
progress pilots. External gates in "Not yet done" remain open.

### Ajouté / Added

- Référence des outils : `docs/TOOLS.md` générée depuis la surface MCP réelle du serveur compilé
  (171 outils + 2 resources + 3 prompts). README et ROADMAP sont liés à cette référence.
- Resources MCP : `rea-plus://server-info` et
  `rea-plus://capabilities-safety` statiques, en lecture seule (n'ouvrent aucune valeur d'env, aucun chemin personnel ni contenu de fichier).
- Prompts MCP : flux `packer-triage`,
  `dotnet-malware-triage` et `android-triage` sans effets secondaires, produisant uniquement du texte.
- Profils `REA_TOOLSETS` : indéfini/vide/`all` = 171 outils ; `minimal` = 8,
  `static` = 98, `android` = 27, `dotnet` = 20, `web` = 26, `debug` = 50.
  L'écriture avec virgules est une union ; un profil inconnu/vide ne retombe jamais silencieusement sur `all`,
  il produit une erreur claire au démarrage. Resources/prompts non filtrés.
- Limite de racine de travail `REA_WORKSPACE_ROOT` : quand elle est définie, les arguments de chemin `rea_*`,
  les chemins conduit `open_target`/`debug_open` et les écritures dérivées visibles par l'utilisateur
  (`.unpacked`, `.extracted`, sortie HAR) sont vérifiés dans la racine avec preuve realpath ;
  non définie, le comportement est inchangé. Les surfaces temp/cache de l'opérateur sont une exception assumée :
  répertoire d'artefacts navigateur, répertoires tmp de projet/entrée Ghidra, fichier tmp de requête
  hopper et cache framework apktool ne sont pas forcés dans la racine.
- Mode lecture seule HTTP sans token : quand `DBG_BRIDGE_TOKEN` est indéfini, HTTP, outre l'avertissement,
  enregistre uniquement une allowlist en lecture seule de 44 outils, sans paramètre de chemin
  (le résultat est l'intersection avec `REA_TOOLSETS`). HTTP avec token et stdio conservent la surface
  complète (ou du toolset). Un outil nouveau/non listé n'apparaît pas en HTTP sans token.
- `REA_AUDIT_LOG` (JSONL, sur les deux transports) : par ligne uniquement `ts`,
  `transport`, `tool`, `durationMs`, `isError`. Arguments, tokens, chemins ou contenu
  cible ne sont jamais écrits ; une erreur d'écriture ferme l'audit avec un seul avertissement, sans planter le serveur.
- Limites HTTP : par IP `REA_HTTP_RATE_LIMIT_PER_MIN` (120/min par défaut) et
  plafond de requêtes actives `REA_HTTP_MAX_CONCURRENT` (16 par défaut) ; en cas de dépassement, `429`.
  Une valeur non entière positive ne retombe pas silencieusement sur le défaut, elle produit une erreur au démarrage.
- Sorties type-safe (base partielle) : 147 outils portent `outputSchema`, 169 outils ont
  des annotations ; sur résultats dont le JSON textuel est un objet plat, `structuredContent` porte la même
  valeur. Les outils hors ensemble de schémas renvoient du JSON textuel sans schéma ; l'état
  par outil figure dans `docs/TOOLS.md`. La couverture de schémas n'est pas encore élargie aux 171 outils.
- Pilote de jobs async : quand `REA_ASYNC_JOBS=1`, 5 outils de jobs
  (`rea_job_start/status/result/cancel/list`) sont enregistrés ; la surface par défaut reste à 171
  outils, la surface opt-in est de 176 outils. La file exécute au plus 2 tâches simultanées,
  les enregistrements sont en mémoire du processus et la whitelist ne contient aujourd'hui que l'outil
  `rea_process_run` recevant AbortSignal ; l'annulation d'une tâche en cours tue l'arbre de processus.
- Pilote Roots : avec `REA_ROOTS=1` et sur le chemin stdio legacy, les racines clientes sont tirées ;
  les racines ne peuvent que restreindre la limite `REA_WORKSPACE_ROOT`. Le flux MRTR du protocole moderne
  est un chantier séparé et n'est pas présenté comme pris en charge.
- Pilote progression/annulation : `rea_process_run` envoie la première notification sans attendre, les suivantes
  à au plus environ 20/s ; `notifications/cancelled` tue l'arbre
  de processus enfant. Les autres handlers synchrones sont hors de ce pilote.
- Préparation de publication : nom de registre `io.github.Alyhnte/rea-plus` et `mcpName` du paquet
  prêts ; le workflow de publication est ajouté comme une préparation déclenchée uniquement à la main, en dry-run par défaut
  (la publication réelle exige une approbation `PUBLISH` explicite).
- Honnêteté du pont jadx (base de code) : paquet/permission/activité du manifeste et extraction FQCN des classes
  reposent sur une vraie analyse ; une exécution jadx réelle n'est pas la preuve de cette entrée.
- Comportement d'exception de l'agent Frida (base de code) : une exception ne correspondant pas à l'adresse du slot installé
  n'est plus avalée comme un breakpoint, elle est rendue au flux réel avec `false`.

### Pas encore fait / Not yet done

- Publication npm effectuée : `rea-plus@0.8.0` au registre, installation consommatrice
  (`npm install` + stdio `initialize`/`tools/list` = 171) vérifiée. Enregistrement au MCP Registry
  effectué : `io.github.Alyhnte/rea-plus` publié (GHA + OIDC). Les installations prises en charge
  sont `npx -y rea-plus` et GHCR.
- La validation Frida sur VM réelle n'est pas terminée ; le point Frida ci-dessus ne compte pas
  comme preuve d'acceptation réelle.
- Le test d'acceptation APK DEX golden (jadx réel + vrai APK) n'est pas terminé ;
  la porte du corpus golden reste ouverte.

## [0.7.4] — 2026-10-13

Correctif de distribution : l'installation par les autres devient facile ; une erreur de paquet
bloquant le consommateur est corrigée. README réécrit (installations en un clic, diagramme d'architecture,
matrice de clients), feuille de route complète dans `docs/ROADMAP.md`.

### Corrigé / Fixed

- Playwright est désormais optionnel et chargé paresseusement. Auparavant dans `devDependencies`
  alors que le code produit l'importait statiquement : quiconque installait le paquet recevait au démarrage
  `ERR_MODULE_NOT_FOUND`. Le serveur démarre sans Playwright, les outils navigateur
  renvoient `capability_unsupported`. Pour le navigateur : `npm i playwright && npx playwright install chromium`.

### Ajouté / Added

- Script `prepare` : les installations git (`npx -y github:Alyhnte/ReaPlus`) compilent dist automatiquement.
- Liens d'installation en un clic (Cursor, VS Code) + exemples de config client :
  Claude Desktop/Code, Cursor, VS Code, Windsurf, Codex, opencode (`configs/`).
- `Dockerfile` + workflow GHCR : aux releases, l'image `ghcr.io/alyhnte/reaplus` est poussée.
- Métadonnées de registre `smithery.yaml` ; chemins personnels nettoyés dans les exemples de config.
- README visuel (badges, Mermaid d'architecture, tableau d'env, modèle de sécurité) et
  `docs/ROADMAP.md` (tableau complet en 9 thèmes, priorisé).

## [0.7.3] — 2026-10-12

Correctif CI/portabilité : la suite de tests par défaut est désormais au vert hors machine de l'auteur
(CI Ubuntu propre, Node 20+22). La même généralisation est appliquée au code produit :
la découverte d'outils repose uniquement sur env + PATH, plus aucun chemin fixe spécifique à une machine.

### Corrigé / Fixed

- Les fixtures de tests lisent le corpus suivi dans le dépôt
  (`tests/corpus`, relatif à `import.meta.url`) au lieu de chemins Temp personnels ; `korpus-kur` ne rafraîchit
  qu'avec les env `REA_KORPUS_ELF`/`REA_KORPUS_PE`.
- Les sondages de présence tiennent compte du fait que `spawnSync` ne lève pas (`r.error`/status) :
  sur une machine sans mitmdump, le produit et le test voient désormais correctement la porte (la fausse
  attente proxy de 13 s a aussi disparu).
- En l'absence d'outils, les tests se comportent selon le principe : sans wabt/upx/ilspy/dnfile/Chromium,
  assert `capability_unsupported` ou skip honnête ; la version UPX n'est plus figée à 5.2.1.
- Découverte d'outils du produit généralisée : `REA_UPX_BIN`, `REA_WABT_BIN`, `REA_AAPT2_BIN` + PATH ;
  chemins personnels WinGet/`C:\tools` supprimés. La recherche python du CIL .NET
  essaie l'ordre `python`/`python3`/`py` (sous Linux, souvent seul python3 existe).
- Le répertoire de projet Ghidra est sous `os.tmpdir()` au lieu d'un chemin personnel ; les tests Ghidra
  ne supposent plus un chemin d'installation par défaut (`REA_GHIDRA_DIR` obligatoire, couloir live).
- Les tests CLI appellent node via `process.execPath`, pas via le PATH.
- Le lanceur de tests imprime une file d'erreurs plus longue pour le diagnostic CI.

### Vérification / Verification

- Local : 43/43 dans un PATH complet comme dans un PATH étroit sans outils ; exécution depuis un autre répertoire aussi au vert.
- CI : Ubuntu Node 20 + 22 au vert (branche `fix/inceleme-duzeltmeleri` et main).

## [0.7.2] — 2026-10-12

Correctifs de revue approfondie : chemins d'entrée/publication cassés, enveloppe d'erreurs, injection
de surfaces, faux résultats `ok` et robustesse des moteurs. Pour les versions intermédiaires (0.2.0–0.7.1),
voir les fichiers `docs/release-v*.md`.

### Corrigé / Fixed

- `npm start` exécute désormais la vraie entrée (`dist/server.js`) ; l'ancienne cible
  (`dist/facade/createReaPlusServer.js`) était une fabrique sans transport, le serveur ne démarrait jamais.
- `npm test` exécute `scripts/run-tests.mjs` au lieu de l'ancien script pointant hors dépôt ;
  le CI exécute désormais vraiment la suite par défaut (43 fichiers).
- Enveloppe d'erreurs : résultats `ok:false` des outils rea et erreurs levées vont désormais vers MCP
  avec `isError: true` ; fini les rapports ressemblant à des succès.
- Le build copie aussi les fichiers runtime (`frida-agent.js`, scripts Ghidra `.py`) ;
  dans le paquet publié, le moteur Frida ne renvoie plus `engine_unavailable`. `prepublishOnly` ajouté.
- Version ramenée à une seule vérité : `package.json`, `server.json`, `server.ts` tous en 0.7.2.
- Le repli `decompile` de Cutter exécutait `pdf` sans analyse puis renvoyait un `ok` vide ; désormais il exécute
  `aaa;pdf`, une sortie vide donne `capability_unsupported`.
- `korpus-kur` conserve le corpus suivi quand les sources Temp personnelles sont absentes (ne plante pas en CI) ;
  le test d'idempotence mesure à la seconde exécution.

### Sécurité / Security

- Entrées d'adresses validées dans les schémas et les ponts (forme hex/nombre/symbole) ; injection
  de commandes r2/rizin (`;`, échappement `!`) fermée.
- Le chemin cmd.exe de radare2 rejette les métacaractères ; la fermeture tue l'arbre de processus
  (aucun petit-enfant r2 orphelin).
- `rea_jeb_sorgu` ne peut POSTer par défaut que vers loopback ; une cible distante
  exige `REA_JEB_ALLOW_REMOTE=1`, les hôtes link-local/metadata restent bloqués dans tous les cas.
- Sans token HTTP, le serveur avertit bruyamment au démarrage (auth désactivée).

### Honnêteté / Honesty

- `rea_dotnet_metadata` ne comptait comme .NET que sur MZ et déclarait chaque PE .NET ; désormais le vrai
  répertoire CLR (DataDirectory[14]) est vérifié, sans lecteur externe obligatoire.
- `rea_pwn_elf_layout` renvoyait un `ok` « en file » factice au lieu de `capability_unsupported`.
- `stdout_sha256_kısa` est désormais vraiment du SHA-256 (auparavant FNV-1a) ; le faux canal PTY et
  la comparaison pipe/PTY sont supprimés — le canal est honnêtement `pipe`, la comparaison passe par la porte.
- `rea_net_capture` cible vraiment l'URL localhost fournie ; le serveur-leurre n'est monté que pour
  une entrée `data:` et est indiqué dans le résumé.

### Robustesse / Robustness

- RPC de l'agent Frida (`callAgent`, `describe`) avec timeouts ; un inject raté ne laisse plus de
  demi-session (nettoyage detach + carte).
- Re-open/re-attach nettoie les checkpoints de l'ancienne cible ; un rewind ne peut plus réécrire vers le mauvais processus.
- En cas de course sur re-open simultané, le debugger de la session écrasée ne reste pas orphelin
  (x64dbg/cdb/frida).

### Tests / Tests

- Nouveau : `tests/fixes-regression.test.mjs` (12 tests) verrouille ces correctifs.
- Suite par défaut : 43 fichiers / 321 its au vert. Tests d'injection/debug live et Ghidra locale
  sous `npm run test:live` (VM/CI), non exécutés en masse sur la machine principale.

## [0.1.0] — 2026-10-12

Premier paquet fonctionnel : conduit gelé, rea ajouté par-dessus.

### Ajoutés / Added

- `src/conduit-core` : conduit à l'identique, en lecture seule. 30 noms d'outils gelés
  (`health`, `session_open/close/list`, `events_pull`, `static_info`,
  `open/close_target`, `disassemble`, `get_cfg`, `xrefs`, `strings`, `dump`,
  `debug_open/attach/close/state/breakpoint/continue/step/pause/registers/
  callstack/memory/code/thread/plugin/time`, `explain`, `prerequisites`).
  Aucun renommage ; règle verrouillée par `toolNamespace.ts`.
- `src/facade` : 7 modules — `sessionRouter`, `toolNamespace`, `catalogMerge`,
  `createReaPlusServer`, `compactSchema`, `evidenceBundle`, `obligationLedger`.
  Règle de préfixe : tout outil d'origine rea est `rea_*` / `hopper_*` / `ghidra_*` /
  `jeb_*` / `evm_*` / `firmware_*` / `browser_*` / `adb_*`.
- `src/rea-domains` : 19 fichiers de domaines (9 dossiers) — hopper, ghidra, ida, jeb,
  javascript (JsAnalyzer/ReconHarness/BinaryDiff), android (Jadx/Adb/Apktool),
  dotnet (ManagedInspector), wasm-evm (WasmEvmBridge/CrashTimeline/GoPwn/
  DosMips/NativeAot), firmware-browser (Firmware/Browser/ProcessCapture).
- `keccak` : sélecteur EVM hors ligne avec `js-sha3` — `transfer(address,uint256)`
  → `0xa9059cbb`, `approve(address,uint256)` → `0x095ea7b3`.
  Le balayage d'exports WAT est aussi hors ligne, sans `wabt` → `capability_unsupported`.
- Nombre d'outils : 8 outils rea → cible 33+ au total ; dans cette version le serveur exécutable
  sert 30 conduit + 8 rea = 38 outils live (trajectoire 8 -> 33 verrouillée).
  Catalogue unifié : 8 conduit + 9 rea = 17 entrées (`mergedCatalog()`, Cutter ajoutée).
- Serveur exécutable : `src/server.ts` → `dist/server.js` (bin : `rea-plus`).
  Transport : stdio (par défaut) + `POST /mcp` et `GET /health` (stateless,
  porte Bearer `DBG_BRIDGE_TOKEN` identique à conduit).
- Configs : JSON stdio + http sous `configs/claude-desktop`, `configs/cursor`, `configs/opencode`
  (avec explication du placeholder `<REA_PLUS_DIR>`).
- Tests : `tests/namespace.test.mjs` (verrou préfixe + collision) et
  `tests/reaplus.smoke.mjs` (sélecteurs keccak + frozen=30 + catalogue=17).
  Exécution : `node tests/namespace.test.mjs`, `node tests/reaplus.smoke.mjs`.
- Hygiène de paquet : `server.json` (io.github.rea-plus), `LICENSE` (MIT 2026),
  `.gitignore`, `.npmrc`, workflow CI.

### Règles / Policy

- Capacité manquante = pas de stub, `capability_unsupported` + suggestion de téléchargement.
- Les tâches live exigent `confirm:true`. Validation localhost HTTP active.
