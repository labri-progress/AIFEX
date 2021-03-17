Etude CrowdTesting
============================

Votre mission est de tester le site [CDiscount](https://www.cdiscount.com/), à la recherche de dysfonctionnements.

Pour cela, nous vous demandons de simuler une commande qui inclue les étapes suivantes dans l'ordre
* Faire une recherche d’un produit via la barre de recherche en tapant un texte dans la barre puis appuyer sur la touche Entrée. Ou en choissant une suggestion dans les choix d'autocompletion.
* Utiliser un ou plusieur filtres pour afiner la recherche.
* Cliquer sur la description, le titre ou l'image d'un produit que vous voulez selectionner.
* Ajouter un produit au panier
* Accéder au panier.
* Choisir la livraison.

Tous vos tests devront obligatoirement inclure ces étapes. Notre plugin AIFEX va vous guider pour suivre ces étapes. **Les elements avec des bordures magenta correspondent aux étapes du scenario.** 

Votre objectif n'est pas de repeter le meme test encore et encore, vous devrez chercher à ajouter de la diversité à vos tests pour maximiser vos chances de trouver des bugs. 
Vous pouvez changer votre recherche, les filtres utilisés, ajouter plusieurs produits au panier, a vous de trouver votre difference. **Utilisez les couleurs des bordures pour savoir quelles actions n'ont jamais été explorées** ! Bleu = Jamais fait. Vert, Orange ou Rouge l'action a déjà été faite dans le meme context, plus c'est chaud plus c'est fréquent. 

À la fin de chaque test, laissez un commentaire pour indiquer que le scénario s’est déroulé correctement ou que vous avez identifié un dysfonctionnement.

Vous devez réaliser **10 tests différents**.

Pour réaliser ces test, vous serez assisté par AIFEX, notre outil pour les tests exploratoires.

----------------------------

<h2>Etape 1, Installer l'extension Chrome de AIFEX </h2>

Vous pouvez installer l'extension directement depuis le [Chrome Store](https://chrome.google.com/webstore/detail/aifex-ai-for-exploratory/dmpbhianmdipngcgmkoijmaphnkhchaj)


----------------------------

<h2>Étape 2, Se connecter à la session de test : </h2>

1. Ouvrez l'extension Chrome de AIFEX.
2. Entrez l'URL de connexion : https://researchexperimentation.fr/join?sessionId=hg-YaJaD5&modelId=pCsI5xRas
3. Connectez-vous à la session. Cette action ouvrira une nouvelle fenêtre Chrome sur le site de CDiscount, pour les prochaines étapes, il faudra rester dans cette fenêtre.
4. Si vous le souhaitez, cliquez sur le bouton en haut a droite de la popup pour l'ouvrir dans une fenetre séparée.
5. Entrez votre nom de testeur qui vous a été donné. **Dans la vidéo je mets mon prénom, ne faites pas la même chose**

Vidéo d’illustration des étapes précédentes

<video controls> 
    <source src="/static/video/connect_to_session.mp4" type="video/mp4">
</video>

----------------------------

<h2>Étape 3, Faire un Test </h2>

Cliquez sur le bouton start pour démarrer votre test. 

Vous devriez voir des bordures de couleur apparaitre autour de certains elements de l'interface. 

* Une bordure bleue, verte, orange ou rouge indique que l'action est monitorée par notre plugin. Si la couleur est bleue, alors personne n'a fait cette action avant vous après avoir fait la meme action que vous juste avant. Sinon, plus la couleur est chaude, plus cette action est choisie souvent ( vert < orange < rouge). 
* Une bordure magenta indique que l'action fait parti du scénario, et qu'il faut la faire pour pouvoir avancer. 

Une fois votre exploration terminée, cliquez sur le bouton stop dans l'extension, (carré) ou sur le bouton restart (boucle), pour commencer une nouvelle exploration. Si vous ne cliquez pas sur un de ces boutons, votre test ne sera pas pris en compte. Faites attention a bien terminer le scenario, sinon votre test ne sera pas accepté, et un message vous previendra.
