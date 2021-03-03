Etude CrowdTesting
============================

Votre mission est de tester le site [CDiscount](https://www.cdiscount.com/), à la recherche de dysfonctionnements.

Pour cela, nous vous demandons de simuler une commande qui inclue les étapes suivantes 
* Faire une recherche d’un produit via la barre de recherche en tapant un texte dans la barre puis appuyer sur la touche Entrée.
* Utiliser les filtres ou les différents menus pour sélectionner finement un produit.
* Regarder la description du produit que vous voulez selectionner.
* Ajouter ce produit au panier et accéder au panier.
* Choisir la livraison.

Tous vos tests devront inclure les étapes précédentes mais être différents, en ajoutant potentiellement des étapes supplémentaires. 

À la fin de chaque test, vous devrez laisser un commentaire pour indiquer que le scénario s’est déroulé correctement ou que vous avez identifié un dysfonctionnement.

Vous devez réaliser **10 tests différents**. 
Après vous être connecté a la session, et avoir rentré votre identifiant de testeur, vous pouvez voir le nombre de tests que vous avez réalisé. Avant de continuer vérifiez bien que le nom que vous avez utilisé a été pris en compte.
**Pensez bien a cliquer le bouton stop ou restart à la fin de chacun de vos tests**. Sinon ils ne seront pas pris en compte.

Pour réaliser votre test, vous serez assisté par AIFEX, notre outil pour les tests exploratoires.

----------------------------

<h2>Etape 1, installer l'extension Chrome de AIFEX : </h2>

1. Téléchargez [l'extension Chrome de AIFEX](/static/chromeExtension.zip)
2. Décompressez la (vous devriez avoir un répertoire **chrome**) 
3. Sur un navigateur chrome, ouvrez la gestion des extensions en tapant chrome://extensions/ ou en cliquant sur Plus d'outils - extensions. La page de gestion des extensions peut également être ouverte en cliquant sur le menu Chrome, en survolant Plus d'outils et en sélectionnant Extensions.
4. Activez le mode développeur en cliquant sur le bouton à bascule situé à côté du mode développeur.
5. Cliquez sur le bouton **LOAD UNPACKED** et sélectionnez le répertoire **chrome**. 
6. Vérifiez que l'extension est disponible.

Vidéo d’illustration des étapes précédentes

<video controls> 
    <source src="/static/video/install_extension.mp4" type="video/mp4">
</video>

----------------------------

<h2>Étape 2, Se connecter à la session de test : </h2>

*code de connexion*: ekwyhBoQd$nfRZE6Wad

1. Ouvrez l'extension Chrome de AIFEX.
2. Entrez le code de connexion :
3. Connectez-vous à la session. Cette action ouvrira une nouvelle fenêtre Chrome sur le site de CDiscount, pour les prochaines étapes, il faudra rester dans cette fenêtre.
4. Si vous le souhaitez, cliquez sur le bouton en haut a droite de la popup pour l'ouvrir dans une fenetre séparée.
5. Entrez votre nom de testeur qui vous a été donné.

Vidéo d’illustration des étapes précédentes

<video controls> 
    <source src="/static/video/connect_to_session.mp4" type="video/mp4">
</video>

----------------------------
<h2>Étape 3, Faire un Test</h2>

Cliquez sur le bouton start pour démarrer votre test. 

Vous devriez voir des bordures de couleur apparaitre autour de certains elements de l'interface. 

Essayez de ne cliquer que sur les elements dont les bordures sont entourées.

Les couleurs sont là pour vous aider à ajouter de la diversité :
* Une bordure bleue indique qu'aucun testeur n'a fait cette action,
* Une bordure verte indique que quelques testeurs ont déjà fait cette action.
* Une bordure orange indique que plusieurs testeurs ont déjà fait cette action.
* Une bordure rouge indique que quasiement tous les testeurs ont fait cette action.

Vidéo d’illustration des étapes précédentes

<video controls> 
    <source src="/static/video/without_evaluator.mp4" type="video/mp4">
</video>

<h2>Étape 4, Mettre un commentaire, et valider l'exploration </h2>
Une fois votre exploration terminée, écrivez un commentaire, si vous n'avez pas trouvé de bug, laissez en quand même un pour dire que tout va bien (RAS). 
Ensuite cliquez sur le bouton stop dans l'extension, (carré) ou sur le bouton restart (boucle), pour commencer une nouvelle exploration. Si vous ne cliquez pas sur un de ces boutons, votre test ne sera pas pris en compte.

