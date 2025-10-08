# 🪶 Atelier de textes – Trappeuses du Québec

Mini-app React autonome pour structurer et rédiger des textes (magazine, blog, podcast, etc.).
Conçu pour Cathy (Cat) – Trappeuses du Québec.

## 🚀 Démarrage local
1) Installe Node.js (>=18) puis :
```bash
npm i
npm run dev
```
App dispo sur http://localhost:5173

## 🏗️ Build
```bash
npm run build
npm run preview
```

## ☁️ Déploiement rapide
- **Netlify** : Connecter ce dossier → Deploy site.
- **Vercel** : Importer le repo → Deploy.
- **GitHub Pages** :
  - Mettre ce projet dans un repo `atelier-trappeuses-react`.
  - Activer Pages → build avec Vite (option `npm run build`), et définir `base` dans `vite.config.js` à `'/atelier-trappeuses-react/'` si nécessaire.
  - L’URL ressemblera à `https://<ton-user>.github.io/atelier-trappeuses-react/`.

## 🔌 Intégration dans ton mini-GPT
Dans la config avancée, mets :

```json
{
  "ui": {
    "type": "react",
    "entrypoint": "https://<ton-user>.github.io/atelier-trappeuses-react/index.html",
    "sandbox": true
  }
}
```

> Si la plateforme GPT te demande un `openapi.yaml`, fournis simplement un fichier minimal (placeholder) ou enlève la section `api`. Cette app est purement UI et ne nécessite pas d’API externe.
