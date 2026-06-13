# 💣 Simulation : Bombe logique & moyens de protection

Petit projet pédagogique de cybersécurité présentant, sous forme de page web
interactive :

- une explication du fonctionnement d'une **bombe logique** (définition,
  déclencheurs, exemples) ;
- une **simulation interactive** d'une attaque sur un serveur de production
  fictif ;
- une présentation des **mesures de protection** (défense en profondeur) et
  de leur effet sur le scénario.

## 📂 Contenu du projet

```
.
├── index.html   # structure de la page (explications, simulation, solutions)
├── style.css    # mise en forme (thème sombre)
├── script.js    # logique de la simulation (aucune action réelle)
└── README.md    # ce fichier
```

## 🚀 Démarrage

Le projet est 100% statique (HTML/CSS/JS vanilla), sans dépendance ni
installation.

### Option 1 — Ouvrir directement le fichier
Double-cliquer sur `index.html` (ou clic droit → « Ouvrir avec » votre
navigateur).

### Option 2 — Servir le dossier via un serveur local (recommandé)

Avec Python :

```bash
python -m http.server 8080
```

Puis ouvrir http://localhost:8080 dans le navigateur.

Avec Node.js :

```bash
npx serve .
```

## 🎮 Utilisation de la simulation

1. **Lire la section 1** pour comprendre ce qu'est une bombe logique et ses
   déclencheurs habituels.
2. Dans la section **Simulation interactive** :
   - Activer ou non une ou plusieurs **mesures de protection** (revue de
     code, moindre privilège, surveillance, sauvegardes).
   - Faire évoluer le scénario avec **« Avancer le temps »** et/ou
     **« Licencier l'employé jdupont »** pour remplir la condition de
     déclenchement de la bombe.
   - Cliquer sur **« Exécuter le script planifié »** pour lancer
     l'exécution et observer dans le **journal** ce qui se passe selon les
     protections actives.
   - Si une attaque a eu lieu et qu'une sauvegarde existe, le bouton
     **« Restaurer depuis la sauvegarde »** permet de récupérer les
     fichiers.
   - **« Réinitialiser »** remet le scénario à zéro.
3. **Lire la section 3** pour le détail des bonnes pratiques permettant de
   prévenir, détecter ou limiter l'impact d'une bombe logique.

## ⚠️ Avertissement

Cette page est une **démonstration pédagogique**. Tous les fichiers, comptes
et journaux affichés sont simulés en mémoire dans le navigateur : aucune
action n'est effectuée sur un système réel.
