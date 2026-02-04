# Création de mon wallet crypto
Le projet consiste en un site capable de recevoir de la monnaie depuis un wallet metamask, de rétirer cet argent et de le transférer à un autre wallet. 


**Détails technique**
La communication avec la blockchain se fait par un smart contrat écrit en solidity dans le fichier     "contract/wallet.sol". Il contient les fonctions necéssaires et il permet que les transactions soit effectives

Le site est réalisé en react et un style en CSS, il communique avec le contrat via l'abi après compilation de celui ci et contient toutes les fonctions nécessaires au bon fonctionnement de l'application.


**Configuration avec le réseau blockchain**
Le contrat est déployé sur le réseau tesnet de sépolia. On a établi la connexion via Alchemy.com après avoir créé une application pour notre projet.
On est aussi sur sepolia sur notre wallet et on valide les transactions via l'adresse suivante : [0x0125C1Ab20eA7576BcCe174D6602949E9615E9f7]. 
On a évité la blockchain locale de hardhat pour des souci de connexion.


### Démarrage du projet en local
git clone "https://github.com/Henoc0/wallet.git"
cd wallet
npm install
npm start