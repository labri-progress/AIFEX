Etude CrowdTesting
============================

Votre mission est de tester le site [CDiscount](https://www.cdiscount.com/), à la recherche de dysfonctionnements.

Pour cela, nous vous demandons de simuler une commande qui inclue les étapes suivantes dans l'ordre
* Faire une recherche d’un produit via la barre de recherche en tapant un texte dans la barre puis appuyer sur la touche Entrée. Ou en choissant une suggestion dans les choix d'autocompletion.
* Utiliser les filtres ou les différents menus pour sélectionner finement un produit.
* Regarder la description du produit que vous voulez selectionner.
* Ajouter ce produit au panier et accéder au panier.
* Choisir la livraison.

Tous vos tests devront obligatoirement inclure ces étapes. Notre plugin AIFEX va vous guider pour suivre ces étapes. 

Votre objectif n'est pas de repeter le meme test encore et encore, vous devrez chercher à ajouter de la diversité à vos tests pour maximiser vos chances de trouver des bugs. Vous pouvez changer votre recherche, les filtres utilisés, ajouter plusieurs produits au panier, a vous de trouver votre difference.

À la fin de chaque test, vous devrez laisser un commentaire pour indiquer que le scénario s’est déroulé correctement ou que vous avez identifié un dysfonctionnement.

Vous devez réaliser **10 tests différents**.

Pour réaliser ces test, vous serez assisté par AIFEX, notre outil pour les tests exploratoires.

----------------------------

<h2>Etape 1, Installer l'extension Chrome de AIFEX </h2>

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

*code de connexion*: qPRWkHyDC$hqMlFZmqx

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

<h2>Étape 3, Faire un Test </h2>

Cliquez sur le bouton start pour démarrer votre test. 

Vous devriez voir des bordures de couleur apparaitre autour de certains elements de l'interface. 

* Une bordure bleue indique que l'action est monitorée par notre plugin.
* Une bordure magenta indique que l'action fait parti du scénario, et qu'il faut la faire pour pouvoir avancer. 

Une fois votre exploration terminée, cliquez sur le bouton stop dans l'extension, (carré) ou sur le bouton restart (boucle), pour commencer une nouvelle exploration. Si vous ne cliquez pas sur un de ces boutons, votre test ne sera pas pris en compte. Faites attention a bien terminer le scenario, sinon votre test ne sera pas accepté, et un message vous previendra.

Vidéo d’illustration des étapes précédentes


<h2> Étape 4, Mettre un commentaire, et valider l'exploration </h2>

Une fois votre exploration terminée, écrivez un commentaire, si vous n'avez pas trouvé de bug, laissez en quand même un pour dire que tout va bien (RAS). 
Ensuite cliquez sur le bouton stop dans l'extension, (carré) ou sur le bouton restart (boucle), pour commencer une nouvelle exploration. Si vous ne cliquez pas sur un de ces boutons, votre test ne sera pas pris en compte.
