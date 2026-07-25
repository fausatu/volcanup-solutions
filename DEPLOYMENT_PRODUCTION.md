# 🚀 Guide de déploiement Tarteaucitron en PRODUCTION

## 📋 Fichiers à déployer

Vous devez transférer ces fichiers vers votre hébergeur:

```
Assets/
├── css/
│   └── tarteaucitron.css              ← À copier
└── js/
    ├── tarteaucitron.min.js           ← À copier
    ├── tarteaucitron-config.js        ← À copier
    └── tarteaucitron-config-fr.js     ← À copier (optionnel)
```

## 🔧 Étapes de déploiement

### 1. Via FTP (Filezilla, WinSCP, etc.)

```
Local                              →  Serveur
Assets/js/tarteaucitron.min.js    →  /public/Assets/js/
Assets/js/tarteaucitron-config.js →  /public/Assets/js/
Assets/css/tarteaucitron.css      →  /public/Assets/css/
```

### 2. Modifier votre config en production

Avant de déployer, vérifiez dans `tarteaucitron-config.js`:

```javascript
tarteaucitron.init({
  "privacyUrl": "/mentions-legales.html",  // ✅ À adapter à votre domaine
  "cookieDomain": ".votredomaine.com",      // ✅ Ajouter votre domaine
  // ... autres paramètres
});
```

### 3. Mettre à jour vos pages HTML en production

Dans chaque page (index.html, contact.html, etc.), ajoutez:

**Dans le `<head>`:**
```html
<link rel="stylesheet" href="/Assets/css/tarteaucitron.css">
```

**Avant `</body>`:**
```html
<script src="/Assets/js/tarteaucitron.min.js"></script>
<script src="/Assets/js/tarteaucitron-config.js"></script>
```

### 4. Tester en production

1. **Vider le cache du navigateur** (Ctrl+Shift+Delete)
2. **Ouvrir la console** (F12)
3. **Vérifier** que la bannière s'affiche
4. **Vérifier** que les cookies se sauvegardent

## ✅ Points de vérification

- [ ] Fichier CSS chargé (vérifier dans Network tab)
- [ ] Fichier JS principal chargé
- [ ] Fichier config chargé
- [ ] Bannière visible au chargement
- [ ] Boutons fonctionnent
- [ ] Cookie crée après acceptation (`tarteaucitron`)
- [ ] Lien politique de confidentialité correct

## 🔒 Sécurité

### URLs HTTPS
Assurez-vous que votre site utilise HTTPS en production (obligatoire pour les cookies).

### Politique de confidentialité
Vérifiez que le lien `privacyUrl` pointe vers votre page de politique réelle:

```javascript
"privacyUrl": "https://votresite.com/politique-confidentialite.html"
```

## ⚡ Optimisations

### Minification
- `tarteaucitron.min.js` est déjà minifié (~87 KB)
- Votre `tarteaucitron-config.js` peut être minifié pour production

### Compression Gzip
Si votre hébergeur supporte gzip, les fichiers seront compressés automatiquement:
- `tarteaucitron.min.js` → ~30 KB gzippé
- `tarteaucitron.css` → ~5 KB gzippé

### Lazy loading (optionnel)
```html
<!-- Charger après le reste du contenu -->
<script src="/Assets/js/tarteaucitron.min.js" defer></script>
<script src="/Assets/js/tarteaucitron-config.js" defer></script>
```

## 🌍 Hébergeurs courants

### OVH
1. Connectez-vous via FTP
2. Naviguer vers `/www/` (ou votre racine web)
3. Créer dossier `Assets` s'il n'existe pas
4. Uploader les fichiers

### 1&1 / Ionos
1. File Manager dans le panneau de contrôle
2. Uploader dans la racine du domaine
3. Structure: `/www/Assets/js/` et `/www/Assets/css/`

### Vercel / Netlify
Si vous utilisez Git:
1. Push les fichiers `Assets/` vers GitHub
2. Vos changements sont automatiquement déployés
3. Pas besoin de FTP!

### WordPress
1. Via FTP: Uploader dans `/wp-content/uploads/`
2. Ou créer un dossier `/assets/` à la racine

## 📞 Troubleshooting

### "Resource not found (404)"
- Vérifier le chemin du fichier
- Vérifier que les fichiers sont bien uploadés
- Vérifier la sensibilité à la casse (Linux est sensible)

### Bannière n'apparaît pas
- Ouvrir Console (F12) et chercher les erreurs
- Vérifier que le CSS est chargé
- Attendre le chargement complet du JS

### Cookies ne se sauvegardent pas
- Vérifier que le site utilise HTTPS
- Vérifier `cookieDomain` dans la config
- Vérifier les paramètres de confidentialité du navigateur

## 🔄 Mise à jour

Pour mettre à jour Tarteaucitron:

1. Télécharger la dernière version
2. Uploader les fichiers (remplacer les anciens)
3. Vider le cache navigateur
4. Vider le cache CDN si applicable

## 📊 Analytics après déploiement

Après déploiement, vérifiez que vos trackers fonctionnent:

```javascript
// Dans la console du navigateur (F12)
console.log(tarteaucitron.state);  // État du consentement
console.log(document.cookie);       // Vérifier le cookie
```

---

**Besoin d'aide ?** Consultez la documentation: https://tarteaucitron.js.org/
