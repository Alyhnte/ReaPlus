# Chrome du site — chaînes françaises (docs/i18n/fr)

> Source : `scripts/site-uret.mjs` (`SAYFALAR` + page d'accueil). Ce fichier ne duplique aucun contenu ;
> il fournit uniquement les libellés français du site pour la vague i18n-fr.
> Génération : `npm run build && node scripts/site-uret.mjs`.

## Pages — titres et descriptions

| Page (`html`) | Source | Titre (FR) | Description (FR) |
|---|---|---|---|
| `readme.html` | `README.md` | README | Installation, clients, fonctionnalités, sécurité |
| `tools.html` | `docs/TOOLS.md` | Référence des outils | Catalogue complet généré (surface réelle) |
| `examples.html` | `docs/EXAMPLES.md` | Exemples | 5 scénarios d'exécution réelle |
| `roadmap.html` | `docs/ROADMAP.md` | Feuille de route | Travaux prioritaires et clôtures |
| `changelog.html` | `CHANGELOG.md` | Journal des modifications | Notes de version (Keep a Changelog) |
| `prompts.html` | `docs/PROMPTS.md` | Bibliothèque de prompts | 10 formulations de questions prêtes à l'emploi |

## Navigation (FR)

- Page d'accueil : `Page d'accueil` (`index.html`)
- Ordre de navigation : Page d'accueil · README · Référence des outils · Exemples · Feuille de route · Journal des modifications · Bibliothèque de prompts
- Titre du site : `ReaPlus Docs`
- Modèle de titre : `<Titre> — ReaPlus Docs`

## Page d'accueil — textes (FR)

- Introduction : `README + Référence des outils + Exemples + Feuille de route + Journal des modifications + Bibliothèque de prompts — un seul site statique. Production : node scripts/site-uret.mjs.`
- Libellé de recherche : `Rechercher dans le site :`
- Placeholder de recherche : `par ex. pcap, recette, fuzz`
- Description de prompt prêt : `prompt prêt`

## Bandeau de résumé — modèle (FR)

- Préfixe : `Résumé de surface (exécution réelle, TOOLS.md) :`
- Modèle : `<N> outils · <N> outputSchema · <N> annotations · <N> resources · <N> prompts`
- Exemple : `191 outils · 187 outputSchema · 191 annotations · 2 resources · 3 prompts`

## Notes de traduction (FR)

- Noms d'outils, commandes, code, chemins, nombres et URL conservés tels quels.
- `confirm:true`, `capability_unsupported`, `confirmation_required`, `engine_unavailable` jamais traduits.
- Noms de champs de schémas (`session_id`, `path`, `ok`, `plan`, …) jamais traduits.
