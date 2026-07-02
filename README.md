# Volcan'up Solutions - Organisation du projet

Ce projet est organise pour separer clairement:

- la structure HTML
- les styles globaux et par page
- les scripts globaux et par page
- les ressources medias (images, icones)

## Structure actuelle

```text
Volcan'up Solutions/
	index.html
	Assets/
		Dossier icones/
		Nouveau site 2026/
			Images A propos/
				Domaines expertise/
			Images Accueil/
			Images Actualites/
			Images contact/
			Images Prestations/
				Images clients/
				Images recrutement/
					Recrutement RPO/
				Images Ressources Humaines/
	css/
		base/
			reset.css
			variables.css
		composants/
			navbar.css
		pages/
			main.css
	js/
		main.js
		pages/
```

## Structure cible recommandee (V2)

Objectif: conserver la logique actuelle, mais standardiser les noms de dossiers pour eviter les problemes de chemins (espaces, apostrophes, accents, majuscules variables).

```text
Volcan-up-solutions/
	index.html
	assets/
		icons/
		site-2026/
			about/
				expertise-domains/
			home/
			news/
			contact/
			services/
				clients/
				recruitment/
					rpo/
				human-resources/
	css/
		base/
			reset.css
			variables.css
		components/
			navbar.css
		pages/
			home.css
			about.css
			services.css
			contact.css
			news.css
	js/
		main.js
		pages/
			home.js
			about.js
			services.js
			contact.js
			news.js
```

## Regles de nommage

- utiliser uniquement des lettres minuscules
- separer les mots avec des tirets (`-`)
- eviter les espaces et les accents
- garder les noms courts et explicites

## Plan de migration progressif

1. Laisser la structure actuelle en place pour ne rien casser.
2. Creer progressivement les dossiers cibles en parallele.
3. Deplacer les images section par section (home, about, services, etc.).
4. Mettre a jour les chemins dans HTML/CSS/JS apres chaque lot de deplacement.
5. Supprimer les anciens dossiers uniquement quand tout est verifie.

## Conventions CSS

- `css/base/` pour reset, variables et styles globaux
- `css/components/` pour les composants reutilisables
- `css/pages/` pour les styles specifiques a chaque page

## Conventions JS

- `js/main.js` pour l'initialisation globale
- `js/pages/*.js` pour la logique specifique a chaque page

## Notes

La migration vers la structure cible peut se faire sans big-bang. Le plus sur est de traiter dossier par dossier avec verification visuelle a chaque etape.
