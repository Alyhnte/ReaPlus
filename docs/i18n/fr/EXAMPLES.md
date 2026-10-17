# Bibliothèque d'exemples de prompts ReaPlus

5 scénarios prêts à l'emploi : commande + sortie attendue + ce que cela signifie. Chaque
commande et chaque nombre présentés ici proviennent d'une exécution réelle
(aucune sortie inventée) ;
`tests/docs-examples.test.mjs` les exécute et les vérifie tous.

Surface (résumé de la référence générée [`TOOLS.md`](TOOLS.md)) : **191 outils**,
**187 outputSchema**, **191 annotations**, 2 resources, 3 prompts.

Prérequis : `npm run build` (les exemples s'exécutent via `dist/`). Les fichiers
du corpus sont en lecture seule (`tests/corpus/`) ; aucun exemple ne les modifie.

## 1) Triage PE — « qu'est-ce que cet exe, et qui appelle-t-il ? »

```bash
node dist/cli/index.js analyze-pe tests/corpus/mini_pe_x64.exe
```

Sortie attendue (exécution réelle) :

```text
dosya: tests/corpus/mini_pe_x64.exe
machine: 0x8664 bit: 64 sections: 1 entry: 0x1000
dll (1): kernel32.dll
fonksiyon (1): kernel32.dll!ExitProcess
```

Ce que cela signifie : `0x8664` = COFF x64, une seule section `.text`, entrée à `0x1000` ;
un seul import `kernel32.dll!ExitProcess` — le profil d'un binaire de test minimal.
Version lisible par la machine :

```bash
node dist/cli/index.js analyze-pe tests/corpus/mini_pe_x64.exe --json
```

```json
{"ok":true,"path":"tests/corpus/mini_pe_x64.exe","machine":34404,
 "machine_hex":"0x8664","bit":"64","section_sayisi":1,"entry":4096,
 "entry_hex":"0x1000","dlls":["kernel32.dll"],
 "fonksiyonlar":["kernel32.dll!ExitProcess"],
 "bolumler":[{"ad":".text","vsize":4096,"vaddr":4096}]}
```

## 2) Manifeste APK — « quel est le nom de ce paquet, ses permissions, ses activités ? »

Si `jadx` est installé (sinon `capability_unsupported` + un indice d'installation est renvoyé,
aucun manifeste inventé n'est produit) :

```bash
node -e "import('./dist/rea-domains/android/JadxBridge.js').then(m=>console.log(JSON.stringify(m.rea_jadx_manifest('tests/corpus/sahte.apk'))))"
```

Sortie attendue (exécution réelle, jadx 1.x) :

```json
{"ok":true,"arac":"rea_jadx_manifest","apk":"tests/corpus/sahte.apk",
 "paket":"com.ornek.sahte","izinler":[],"aktiviteler":[]}
```

Ce que cela signifie : jadx ouvre les sources avec `--no-src` puis analyse
`AndroidManifest.xml` ; l'APK de corpus factice contient un nom de paquet mais aucune
permission ni activité — dans une application réelle, on y listerait des permissions
comme `INTERNET` et des activités comme `.MainActivity`. Avec `rea_jadx_classes` on
descend vers la liste des classes, avec `rea_jadx_decompile` vers la source d'une seule classe.

## 3) Profil comportemental — « ordonner les événements sur une chronologie »

Fonction pure, sans exécution — ordonne les événements API/syscall/net/fichier/processus
par priorité de source, et produit un résumé premier/dernier + top-5 des API :

```bash
node -e "import('./dist/rea-domains/behavior/BehaviorTimeline.js').then(m=>console.log(m.rea_behavior_timeline([
 {\"kaynak\":\"api\",\"zaman\":3,\"detay\":\"CreateFileW\"},
 {\"kaynak\":\"net\",\"zaman\":1,\"detay\":\"dns:ornek.test\"},
 {\"kaynak\":\"api\",\"zaman\":2,\"detay\":\"CreateFileW\"},
 {\"kaynak\":\"process\",\"zaman\":4,\"detay\":\"exit:0\"}
]).summary))"
```

Sortie attendue (exécution réelle) :

```text
4 olay api@2 -> process@4 top_api=CreateFileW
```

Ce que cela signifie : les 4 événements sont ordonnés non pas chronologiquement mais par
**priorité de source** (api > syscall > net > fichier > processus) ; `sayılar`
donne `{api:2, net:1, process:1}`, `top_api` donne l'API la plus fréquente. Avec une liste
vide ou incomplète, `capability_unsupported` est renvoyé — aucune chronologie vide n'est inventée.

## 4) Analyse de dépôt — « quels types de fichiers y a-t-il dans ce répertoire ? »

Détection PE/ELF/APK/JS/WASM par octets magiques + indice d'extension, suggestion de moteur et
plan en 5 fichiers (entièrement hors ligne, `.git`/`node_modules`/`dist` ignorés) :

```bash
node -e "import('node:fs').then(async fs=>{const {rea_scan_repo}=await import('./dist/rea-domains/reposcan/RepoScan.js');
const r=await rea_scan_repo('<hedef-dizin>');console.log(r.summary,JSON.stringify(r.details.tipler));})"
```

Exécution réelle dans un répertoire de 5 fichiers magiques :

```text
5 dosya, 5 tip {"pe":1,"elf":1,"apk":1,"js":1,"wasm":1}
```

Ce que cela signifie : chaque fichier est listé comme un triplet `chemin/type/moteur`
(par ex. `.exe` → `pe`/`cutter`, `.apk` → `apk`/`jadx`, `.elf` →
`elf`/`radare2`) ; `planlar` donne, pour chaque fichier, l'outil suivant recommandé.
Sans cible / répertoire vide : liste vide (`ok:true`) ; répertoire inexistant :
`capability_unsupported`.

## 5) Téléchargement PDB — « du record de débogage vers le symbole »

Étape 1 — résoudre l'identité PDB depuis le record CodeView RSDS (lecture seule) :

```bash
node -e "import('./dist/rea-domains/typedef/PdbReader.js').then(m=>console.log(JSON.stringify(m.rea_pdb_yolu('<debug-bilgili.exe>'))))"
```

Exécution réelle sur un PE avec informations de débogage (exemple produit localement) :

```json
{"ok":true,"arac":"rea_pdb_yolu","pdb":"ornek_test.pdb",
 "guid":"ABCDEF01-2345-6789-ABCD-EF0123456789","yas":1}
```

Sans record de débogage, `bulunamadi` est renvoyé (`PDB debug kaydı yok`) — aucun
GUID n'est inventé.

Étape 2 — téléchargement selon la disposition du serveur de symboles Microsoft + intégrité + cache :

```text
<server>/ornek_test.pdb/ABCDEF0123456789ABCDEF01234567891/ornek_test.pdb
```

Ce que cela signifie : l'URL suit le schéma `Nom/GUID-sans-tirets+AGE/Nom` ; le fichier
téléchargé est vérifié par signature MSF + motif GUID+âge, puis écrit sous
`<önbellek>/Ad/SİG/Ad` ; le second appel renvoie `cache:true` sans passer par le réseau. Un contenu
corrompu est rejeté avec `butunluk_hatasi`, aucun fichier incomplet n'est écrit ; sans réseau :
`ag_hatasi` — aucun faux PDB n'est jamais écrit. Le répertoire de cache
se déplace avec `REAPLUS_SYMBOL_CACHE`.

## Étapes suivantes

- Liste complète des outils : [`TOOLS.md`](TOOLS.md) (générée, 187 outils).
- Flux de vérification : [`VERIFY.md`](VERIFY.md) ; flux de contribution : `CONTRIBUTING.md`.
