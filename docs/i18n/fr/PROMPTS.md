# Bibliothèque de prompts ReaPlus (10 prompts prêts à l'emploi)

Les 10 formulations de questions prêtes à l'emploi que l'agent posera à rea-plus. Chaque prompt : **Objectif** +
**Exemple d'appel** (forme réelle MCP/`rea-plus-cli`, noms de champs identiques à la
référence générée [`TOOLS.md`](TOOLS.md)) + type de **Sortie attendue**.
Surface : **187 outils**, **183 outputSchema**, **187 annotations**, 2 resources, 3 prompts.

> Remarque : les appels de débogage live exigeant `confirm:true` ne figurent pas dans la liste ; les
> 10 prompts ci-dessous sont tous des flux en lecture seule / statiques.

## 1) Triage — « qu'est-ce que ce fichier, par où commencer ? »

**Objectif :** classifier un fichier inconnu en un seul appel et obtenir le plan des étapes suivantes.

**Exemple d'appel :**

```json
{ "name": "rea_investigate", "arguments": { "path": "sample.exe" } }
```

**Sortie attendue :** objet avec champs `ok/plan/skor/tip/motor/yedekler` (champs `outputSchema` :
`arac, motor, ok, plan, skor, tip, yedekler`) ; type (pe/elf/apk/…),
score de confiance, moteur recommandé + liste de plans de repli.

## 2) Manifeste — « quels sont le paquet, les permissions et les activités de cet APK ? »

**Objectif :** résoudre l'identité `AndroidManifest.xml` de l'APK via jadx.

**Exemple d'appel :**

```bash
node -e "import('./dist/rea-domains/android/JadxBridge.js').then(m=>console.log(JSON.stringify(m.rea_jadx_manifest('tests/corpus/sahte.apk'))))"
```

**Sortie attendue :** objet avec champs `ok/paket/izinler/aktiviteler` ; sans jadx,
`capability_unsupported` + indice d'installation au lieu d'un manifeste inventé.

## 3) Comportement — « ordonner les événements sur une chronologie »

**Objectif :** produire un résumé par priorité de source à partir d'événements API/syscall/net/fichier/processus
(sans exécution, fonction pure).

**Exemple d'appel :**

```bash
node -e "import('./dist/rea-domains/behavior/BehaviorTimeline.js').then(m=>console.log(m.rea_behavior_timeline([
 {\"kaynak\":\"api\",\"zaman\":3,\"detay\":\"CreateFileW\"},
 {\"kaynak\":\"net\",\"zaman\":1,\"detay\":\"dns:ornek.test\"},
 {\"kaynak\":\"api\",\"zaman\":2,\"detay\":\"CreateFileW\"},
 {\"kaynak\":\"process\",\"zaman\":4,\"detay\":\"exit:0\"}
]).summary))"
```

**Sortie attendue :** résumé textuel (format `4 olay api@2 -> process@4 top_api=CreateFileW`)
+ détails `sıralı/sayılar/top_api/ilk/son` ; liste vide → `capability_unsupported`.

## 4) Dépôt — « quels types de fichiers y a-t-il dans ce répertoire ? »

**Objectif :** détecter les fichiers PE/ELF/APK/JS/WASM d'un répertoire par octets magiques et
obtenir le plan d'outil suivant par fichier.

**Exemple d'appel :**

```json
{ "name": "rea_scan_repo", "arguments": { "path": "<hedef-dizin>" } }
```

**Sortie attendue :** texte `summary` (format `5 dosya, 5 tip …`) +
comptage `details.tipler` + `details.planlar` (fichier → moteur recommandé) ;
répertoire sans cible : liste vide (`ok:true`).

## 5) PDB — « du record de débogage vers le symbole »

**Objectif :** résoudre l'identité PDB depuis le record CodeView RSDS du PE, puis télécharger
selon la disposition du serveur de symboles Microsoft (avec intégrité + cache).

**Exemple d'appel :**

```bash
node -e "import('./dist/rea-domains/typedef/PdbReader.js').then(m=>console.log(JSON.stringify(m.rea_pdb_yolu('<debug-bilgili.exe>'))))"
```

**Sortie attendue :** à l'étape 1, `pdb/guid/yas` (champs de `rea_pdb_yolu` :
`arac, dosya, guid, ok, pdb, yas`) ; à l'étape 2, URL de forme `Ad/GUID-tiresiz+YAŞ/Ad`,
info `yol/cache` (champs de `rea_pdb_indir` :
`arac, cache, dosya, guid, ok, pdb, url, yas, yol`) ; contenu corrompu →
`butunluk_hatasi`, second appel → `cache:true`.

## 6) Diff — « quelle est la différence de fonctions entre deux versions ? »

**Objectif :** comparer les listes de fonctions de deux versions d'un binaire et obtenir les
ensembles ajoutés/supprimés/modifiés/inchagés (point d'entrée d'une revue N-day).

**Exemple d'appel :**

```json
{ "name": "rea_bindiff_karsilastir", "arguments": { "text": "<rea_bindiff_fonksiyonlar çıktısı>" } }
```

**Sortie attendue :** objet avec champs `aynen/cikarilan/degisen/eklenen/eski/yeni/istatistik/ozet` ;
l'entrée est la sortie de `rea_bindiff_fonksiyonlar` (`path` obligatoire).

## 7) Pcap — « quels flux y a-t-il dans cette capture, et le TLS se déchiffre-t-il ? »

**Objectif :** réassembler les flux d'un fichier PCAP ; si un keylog est fourni, déchiffrer le contenu TLS.

**Exemple d'appel :**

```json
{ "name": "rea_pcap_oku", "arguments": { "path": "ornek.pcap" } }
```

Avec keylog :

```json
{ "name": "rea_pcap_oku", "arguments": { "path": "ornek.pcap", "keylog": "sslkeylog.txt" } }
```

**Sortie attendue :** liste de flux réassemblés dans `details/summary`
(`outputSchema` présent) ; `keylog` est optionnel — sans lui, les méta-flux sont renvoyés
sans déchiffrer le contenu chiffré.

## 8) Recette — « produire et valider un plan d'analyse dynamique pour cet APK »

**Objectif :** produire une recette d'analyse dynamique à validation à sec depuis le chemin de l'APK
(sans exécution, plan + validation).

**Exemple d'appel :**

```json
{ "name": "rea_android_dinamik_recete", "arguments": { "path": "ornek.apk" } }
```

Puis, avec le texte de la recette :

```json
{ "name": "rea_android_recete_dogrula", "arguments": { "text": "<recete-metni>" } }
```

**Sortie attendue :** le premier renvoie un objet avec champ `recete` ; le second un
résultat de validation avec champs `adim_sayisi/ok`.

## 9) Fuzz — « les analyseurs survivent-ils à des entrées corrompues ? »

**Objectif :** soumettre les analyseurs PE/ELF/WASM/metadata à des entrées corrompues issues de graines du corpus
et balayer crashes/exceptions (écriture limitée à tmpdir).

**Exemple d'appel :**

```bash
node scripts/fuzz-parsers.mjs
```

**Sortie attendue :** résumé console (nombre de graines, liste des entrées qui plantent ; zéro plantage
sur une exécution propre) + `tests/parser-fuzz.test.mjs` au vert ; le corpus
(`tests/corpus/`) reste en lecture seule.

## 10) Perf — « les budgets de listage/démarrage sont-ils tenus ? »

**Objectif :** mesurer le temps de réponse `tools/list` + le temps de démarrage du serveur et
attraper les régressions par les tests.

**Exemple d'appel :**

```bash
node tests/perf-budget.test.mjs
```

**Sortie attendue :** sortie node:test (seuils de budget définis dans `tests/perf-budget.test.mjs`) ;
un dépassement de seuil fait rougir le test, les durées sont rapportées en console
en millisecondes.
