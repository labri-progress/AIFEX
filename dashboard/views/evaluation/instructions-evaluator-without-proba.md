Etude CrowdTesting
============================

Votre mission est de tester le site [CDiscount](https://www.cdiscount.com/), à la recherche de dysfonctionnements.

Pour cela, nous vous demandons de simuler une commande qui inclue les étapes suivantes 
* Faire une recherche d’un produit via la barre de recherche en tapant un texte dans la barre puis appuyer sur la touche Entrée.
* Utiliser les filtres ou les différents menus pour sélectionner finement un produit.
* Regarder la description du produit que vous voulez selectionner.
* Ajouter ce produit au panier et accéder au panier.
* Choisir la livraison.

Ces étapes doivent apparaitre dans les tests, mais vous pouvez parfaitement en ajouter d'autres.

Tous vos tests devront inclure les étapes précédentes mais **être différents**, en effet il n'est pas utile de refaire plein de fois la même chose.

À la fin de chaque test, vous devrez laisser un commentaire pour indiquer que le scénario s’est déroulé correctement ou que vous avez identifié un dysfonctionnement.

Vous devez réaliser **10 tests différents**.

Pour réaliser votre test, vous serez assisté par AIFEX, notre outil pour les tests exploratoires.
Dans cette version, AIFEX vous aidera a identifier l

----------------------------

<h2>Etape 1, Installer l'extension Chrome de AIFEX </h2>

1. Téléchargez [l'extension Chrome de AIFEX](/static/extension_evaluator_without_proba.zip)
2. Décompressez la (vous devriez avoir un répertoire **chrome**) 
3. Sur un navigateur chrome, ouvrez la gestion des extensions en tapant chrome://extensions/ ou en cliquant sur Plus d'outils - extensions. La page de gestion des extensions peut également être ouverte en cliquant sur le menu Chrome, en survolant Plus d'outils et en sélectionnant Extensions.
4. Activez le mode développeur en cliquant sur le bouton à bascule situé à côté du mode développeur.
5. Cliquez sur le bouton **LOAD UNPACKED** et sélectionnez le répertoire **chrome** que vous avez dézippé. 
6. Vérifiez que l'extension est disponible.

Vidéo d’illustration des étapes précédentes

<video controls> 
    <source src="/static/video/install_extension.mp4" type="video/mp4">
</video>

----------------------------

<h2>Étape 2, Se connecter à la session de test : </h2>

*code de connexion*: p3eVv2jLZ$4E62rY2Pm

1. Ouvrez l'extension Chrome de AIFEX.
2. Entrez le code de connexion ci dessus, et cliquez sur le bouton de connexion. 
    Cette action ouvrira une nouvelle fenêtre Chrome sur le site de CDiscount. A partir de maintenant il faut faire toutes les actions dans cette page.
3. Reouvrez l'extension dans la page CDiscount qui vient de s'ouvrir, ecrivez votre code d'anonymat dans le champ tester et appuyez sur entrée pour valider. 
5. Si vous le souhaitez, cliquez sur le bouton en haut a droite de la popup de l'extension pour l'ouvrir dans une fenetre séparée.

Vidéo d’illustration des étapes précédentes

<video controls> 
    <source src="/static/video/connect_to_session.mp4" type="video/mp4">
</video>

----------------------------

<h2>Étape 3, Faire un Test </h2>

1. Cliquez sur le bouton start ou restart pour démarrer votre test.

<img src="/static/images/plugin1.png" height=350px>

2. Vous devez voir des bordures bleues apparaitre autour de certains elements de l'interface. Ces bordures correspondent aux elements qui sont monitorés par AIFEX. Pour que nous puissions correctement récuperer vos tests, il faut cliquer uniquement sur les elements avec des bordures bleues.
<img src="/static/images/plugin2.png" width=900px>

3. Suivez le scenario suivant, vous pouvez retrouver le scenario directement dans le plugin. Pour vous guider, une bordure de couleur magenta apparait a l'interieur des elements correspondant à l'étape en cours. Notez bien que vous pouvez faire des actions supplementaire dans vos tests, ne vous limitez pas uniquement aux elements avec une bordure magenta. :
* Faire une recherche d’un produit via la barre de recherche en tapant un texte dans la barre puis appuyer sur la touche Entrée.
* Utiliser les filtres ou les différents menus pour sélectionner finement un produit.
* Regarder la description du produit que vous voulez selectionner.
* Ajouter ce produit au panier et accéder au panier.
* Choisir la livraison.

<h2> Étape 4, Mettre un commentaire, et valider l'exploration </h2>

Une fois votre exploration terminée, avant de cliquer sur stop ou restart, écrivez un commentaire, si vous n'avez pas trouvé de bug, laissez en quand même un pour dire que tout va bien (RAS). 
Ensuite cliquez sur le bouton stop dans l'extension, (carré) ou sur le bouton restart (boucle), pour commencer une nouvelle exploration. Si vous ne cliquez pas sur un de ces boutons, votre test ne sera pas pris en compte.
