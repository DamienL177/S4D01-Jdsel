const Joueur = require('../client/src/nodeClasses/Joueur.mjs');
const JHumain = require('../client/src/nodeClasses/typeJoueurs/joueurHumain.mjs');
const tCarte = require('../client/src/nodeClasses/Carte.mjs');

const http = require('http');
const express = require('express');
const socketio = require('socket.io');

const app = express();

const clientPath = __dirname + '/../client/src';

app.use(express.static(clientPath));

const server = http.createServer(app);

const io = socketio(server);

var sockJ1 = null;
var sockJ2 = null;

let lesJoueurs = Array(new JHumain('Joueur1'), new JHumain('Joueur2'));
//console.log(lesJoueurs);
let lesCartes = initCartes();

let indice = null;
let joueurJouant = null;
let lesCoups = [];
var nbConnectes = 0;

io.on('connection', (sock) => {
    
    sock.on("Jconnecte", () => {
        nbConnectes += 1;
        if(nbConnectes == 1){
            sockJ1 = sock;
            sockJ1.emit("attendre");
            console.log("Premier utilisateur connecté");
        }
        else if(nbConnectes == 2){
            sockJ2 = sock;
            sockJ2.emit("attendre");
    
            console.log("Deuxieme utilisateur connecté");
            
            sockJ1.emit("afficher", lesJoueurs, lesCartes);
            sockJ2.emit("afficher", lesJoueurs, lesCartes);
    
            indice = Math.random() * 2;
    
            let unJoueur = lesJoueurs[indice];
            console.log(indice);
            //console.log(lesJoueurs);
            //joueurJouant = unJoueur['pseudo'];
    
            if(indice == 0){
                sockJ1.emit("jouer");
            }
            else{
                sockJ2.emit("jouer");
            }
        }
    })

    sock.on("error", (err) => {
        console.log("Une erreur s'est produite :" + err)
    })

    sock.on("UnCoupJoue", (coup) => {
        let i;

        for(i = 0; i < lesCartes.length; i++){
            if(lesCartes[i].getPosition() == coup){
                lesCartes[i].retournerCarte();
                sockJ1.emit("afficher", lesJoueurs, lesCartes);
                sockJ2.emit("afficher", lesJoueurs, lesCartes);
                lesCoups.push(coup);
            }
        }

        
    })

    sock.on("TourFini", () => {
        // On récupère les indexs des coups du joueur
        let coup1 = lesCoups[0];
        let coup2 = lesCoups[1];
        // On dit à tous les joueurs sauf celui qui vient de jouer que l'un d'entre eux à joué
        for(let i = 0; i < lesJoueurs.length; i++){
            if(lesJoueurs[i].getPseudo() != joueurJouant){
                lesJoueurs[i].retenirCartesHumains(coup1, coup2)
            }
        }
        // Si les cartes ont les mêmes valeurs
        if(lesCartes[retournerIndexParPosition(coup1)].equals(lesCartes[retournerIndexParPosition(coup2)])){
            // On attend d'avoir retirer les deux cartes du jeu
            retirerCarte(coup1)
            retirerCarte(coup2)

            // On ajoute un au score du joueur
            lesJoueurs[indice].setScore(lesJoueurs[indice].getScore() + 1)


        }
        // Sinon
        else{
            // On retourne les deux cartes
            lesCartes[retournerIndexParPosition(coup1)].retournerCarte()
            lesCartes[retournerIndexParPosition(coup2)].retournerCarte()

        }

        sockJ1.emit("afficher", lesJoueurs, lesCartes);
        sockJ2.emit("afficher", lesJoueurs, lesCartes);

        indice = (indice + 1) % 2;
        
        joueurJouant = lesJoueurs[indice].getPseudo();

        if(indice == 0){
            sockJ1.emit("jouer");
        }
        else{
            sockJ2.emit("jouer");
        }        

    })

})


server.on('error', (err) => {
    console.error('Server error:', err);
})
server.listen(8080, () => {
    console.log('On écoute sur le port 8080');
})

// On retire une carte de la liste mesCartes
function retirerCarte(uneCarte){
    // On parcourt la liste des cartes
    for(let i = 0; i < lesCartes.length; i ++){
        // Si la Carte est présente dans la liste à l'indice i
        if(lesCartes[i].getPosition() == uneCarte){
            // On retire la carte
            lesCartes.splice(i, 1)
            // On retourne vrai tout en disant à Javascript qu'il peut reprendre son cours normal
            return true
        }
    }
    // On retourne faux tout en disant à Javascript qu'il peut reprendre son cours normal
    return false
}

// On cherche l'index d'une carte par sa position
function retournerIndexParPosition(position){
    // On fait une recherche de première occurrence
    for(let i = 0; i < lesCartes.length; i++){
        if(lesCartes[i].getPosition() == position){
            return i
        }
    }
    // Si rien n'est trouvé on retourne -1
    return -1
}

function initCartes(){
    // ATTRIBUTS
    let lettres = ['A', 'B', 'C', 'D', 'E', 'F']    // Les lettres possibles pour le positionnement (de AA à FF)
    let tailleLettres = 6   // La taille de la liste lettres
    let listeValeurs = []   // La liste des valeurs qui pourront être prises par les cartes
    let listePosition = []  // Une liste qui contiendra toutes les positions des cartes
    let listeCartes = []

    // TRAITEMENTS
    
    // Chaque carte fait partie d'une paire dont les valeurs vont de 1 à nbCartes / 2
    // Pour chaque valeur allant de 1 à nbCartes / 2 (36 à la date 28 décembre 2022)
    for(let i = 1; i <= 36 / 2; i++){
        // On place deux foix cette valeur dans la liste des valeurs possibles
        listeValeurs.push(i, i)
    }

    // Pour toutes les cartes qui seront dans le jeu
    for(let i = 0; i < 36; i++){

        // On récupère le reste de la division euclidienne de l'indice i par la taille du tableau lettres
        let reste = i % tailleLettres

        // On calcule la première lettre comme étant la division de l'indice i par la taille du tableau lettres.
        // On soustrait le reste à l'indice i afin d'obtenir un entier entre 0 et 6 et non un flottant
        let lettreUne = lettres[(i - reste)/tailleLettres]
        //window.alert(lettreUne)
        
        // La position de la carte correspond donc à la première lettre, suivie de la lettre du tableau dont l'indice correspond au reste
        let position =  lettreUne + lettres[reste]
        
        // On récupère aléatoirement l'index d'une valeur parmis la liste des valeurs possible
        let index = ~~(Math.random() * listeValeurs.length)

        // Cette valeur aléatoire correspond à la valeur de la carte
        let valeurCarte = listeValeurs[index]

        // On enlève cette valeur de la liste des valeurs possibles
        listeValeurs.splice(index, 1)

        // On créé une carte avec sa position et sa valeur
        let uneCarte = new tCarte(position, valeurCarte)
        //window.alert(listeValeurs)

        // On ajoute la carte à la liste
        listeCartes.push(uneCarte)

        // On rajoute la position dans la liste des positions des cartes
        listePosition.push(position)
        
    }

    return listeCartes
}

