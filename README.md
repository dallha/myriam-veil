# 🏛️ Maison Myriam Veil — Luxury Senegalese E-Commerce

Une vitrine e-commerce de Haute Couture et Joaillerie fine haut de gamme, entièrement localisée pour le marché sénégalais. Ce projet combine une esthétique visuelle immersive (sombres néons, glassmorphism, typographies éditoriales) à une architecture moderne, fluide et autonome (Serverless / Local-First).

---

## ✨ Fonctionnalités Majeures

### 1. 🇸🇳 Localisation Sénégalaise Pure
*   **Tarification en Franc CFA (FCFA)** : Conversion élégante et cohérente de l'ensemble du catalogue haut de gamme, avec formatage lisible par séparateurs de milliers.
*   **Fiscalité Locale** : Calcul automatisé des taxes intégrant le taux de **TVA officiel sénégalais de 18%**.
*   **Logistique Territoriale** : Options de livraison ciblées : *Dakar Express (Gratuit)* et *Hors Dakar (Régions)*.

### 2. 🔐 Console Directeur & Double CMS (Hybride)
*   **Édition Visuelle Directe (WYSIWYG)** : L'administrateur connecté peut survoler n'importe quelle section de la page d'accueil (Hero, Histoire, Valeurs, Témoignages) pour la modifier à la volée via des formulaires crayons.
*   **Console d'Administration Plein Écran** : Un espace de travail complet pour piloter l'e-commerce :
    *   **📊 Aperçu & Métriques** : Suivi du chiffre d'affaires cumulé en direct, panier moyen en FCFA, volume de commandes et mini-graphique (SVG) d'activité.
    *   **🛍️ Gestionnaire de Commandes (Order Manager)** : Réception et gestion des commandes en temps réel. Suivi du profil client (adresse de livraison, téléphone) et pilotage des statuts logistiques (*Nouvelle*, *En préparation*, *Expédiée*, *Livrée*).
    *   **Catalogue Interactif** : Recherche, modification, ajout et suppression de pièces de mode en temps réel.
    *   **Sauvegardes Portables** : Exportation et importation à chaud de toute la base de données au format JSON structuré pour une portabilité totale entre appareils.

### 3. 🛡️ Authentification par Email Authentique (Production-Ready)
*   **Moteur Double-Mode** :
    1.  **Production (Supabase Cloud)** : En production, l'accès est entièrement sécurisé par une authentification par Email + Mot de passe connectée à l'API **Supabase Auth** de manière cryptographique et sécurisée.
    2.  **Développement (Émulation Locale)** : En local, pour faciliter les tests du développeur, le portail fonctionne de manière autonome en acceptant un profil d'administrateur configuré par défaut.
*   **Interface Sécurisée** : Écran de connexion moderne avec masquage/affichage du mot de passe, indicateur de chargement réseau, et diagnostic d'état de la base de données.

### 4. ⚡ Performance Optimisée (60 FPS constants)
*   **Accélération Matérielle** : Verres dépolis et fenêtres modales configurés pour utiliser la puissance du processeur graphique (GPU) afin de prévenir tout ralentissement.
*   **Gradients Radiaux Fixes** : Remplacement des animations de flous denses par un arrière-plan fixe matériellement optimisé, assurant un défilement ultra-fluide sur smartphones, tablettes et ordinateurs.
*   **Blurs Intelligents** : Optimisation des calculs de filtres graphiques complexes sur les éléments interactifs.

---

## 🚀 Démarrage Rapide

### Prérequis
*   [Node.js](https://nodejs.org/) (Version 18 ou supérieure recommandée)

### Installation
1.  Installez les dépendances :
    ```bash
    npm install
    ```
2.  Démarrez le serveur de développement local :
    ```bash
    npm run dev
    ```
3.  Ouvrez l'adresse [http://localhost:3000/](http://localhost:3000/) dans votre navigateur.

---

## 🔒 Configuration de Production (Déploiement en ligne)

Pour basculer d'une démonstration locale à un site internet pleinement opérationnel et sécurisé en ligne, connectez simplement le projet à un service cloud **Supabase** (gratuit, 2 minutes de configuration) :

1.  Créez un projet sur [Supabase.com](https://supabase.com/).
2.  Dans **Authentication**, créez l'adresse email et le mot de passe de votre administrateur.
3.  Dans votre panneau de configuration d'hébergeur en ligne (ex: Vercel, Netlify), ajoutez les deux variables d'environnement suivantes :
    *   `VITE_SUPABASE_URL` : *L'URL de votre API de projet Supabase.*
    *   `VITE_SUPABASE_ANON_KEY` : *Votre clé Anon/Public de projet Supabase.*

*Note : Ne stockez jamais vos clés d'API privées directement dans votre code source ou vos fichiers GitHub publics. Utilisez toujours les variables d'environnement fournies par votre hébergeur.*