const Joueur = require('../client/src/nodeClasses/Joueur.mjs');
const JHumain = require('../client/src/nodeClasses/typeJoueurs/joueurHumain.mjs');
const tCarte = require('../client/src/nodeClasses/Carte.mjs');

const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const Carte = require('../client/src/nodeClasses/Carte.mjs');

const app = express();

const clientPath = __dirname + '/../client/src';

app.use(express.static(clientPath));

const server = http.createServer(app);

const io = socketio(server);


let listeRoom = {};

io.on('connection', (sock) => {
    
    sock.on("Jconnecte", (room, pseudoJoueur) => {
        if(!(room in listeRoom)){
            let nomRoom = room;
            let joueursDansRoom = {0: pseudoJoueur};
            let socksDansRoom = {0: sock};
            let scoresJoueurs = {0: 0, 1: 0};
            let lesCartes = initCartes();
            let coupsTours = new Array();
            let uneRoom = {"nom": room, "listeJoueurs": joueursDansRoom, "listeSocks": socksDansRoom, "scoresJoueurs": scoresJoueurs, "cartes": lesCartes, "coupsTour" : coupsTours};
            listeRoom[room] = uneRoom;
            let sockJ1 = listeRoom[room]["listeSocks"][0];
            sockJ1.join(room);
            sockJ1.emit("attendre");
            console.log("Premier utilisateur connecté");
        }
        else{
            console.log(typeof(listeRoom[room]["listeSocks"]))
            if(listeRoom[room]["listeSocks"].length < 2){
                listeRoom[room]["listeJoueurs"][1] = pseudoJoueur;
                listeRoom[room]["listeSocks"][1] = sock;
                let sockJ2 = listeRoom[room]["listeSocks"][1];
                sockJ2.join(room);
                sockJ2.emit("attendre");
        
                console.log("Deuxieme utilisateur connecté");

                let lesJoueurs = Array(new JHumain(listeRoom[room]["listeJoueurs"][0]), new JHumain(listeRoom[room]["listeJoueurs"][1]));
                listeRoom[room]["listeJoueurs"][0].setScore(0);
                listeRoom[room]["listeJoueurs"][1].setScore(0);

                io.to(room).emit("afficher", listeJoueursEnString(lesJoueurs), listeCartesEnString(listeRoom[room]["cartes"]))
                
                indice = Math.floor(Math.random() * 2);
        
                listeRoom[room]["listeSocks"][indice];
            }
            
        }
    })

    sock.on("error", (err) => {
        console.log("Une erreur s'est produite :" + err)
    })

    sock.on("UnCoupJoue", (room, coup) => {
        //console.log(coup)
        let i;
        for(i = 0; i < listeRoom[room]['cartes']; i++){
            //console.log(lesCartes[i].getPosition())
            if(listeRoom[room]['cartes'][i].getPosition() == coup){
                //console.log("OK");
                lesCartes[i].retournerCarte();
                let lesJoueurs = Array(new JHumain(listeRoom[room]["listeJoueurs"][0]), new JHumain(listeRoom[room]["listeJoueurs"][1]));
                io.to(room).emit("afficher", listeJoueursEnString(lesJoueurs), listeCartesEnString(listeRoom[room]["cartes"]))
                listeRoom[room]["coupsTour"].push(coup);
                break;
            }
        }

        
    })

    sock.on("TourFini", () => {
        // On récupère les indexs des coups du joueur
        let coup1 = listeRoom[room]["coupsTour"][0];
        let coup2 = listeRoom[room]["coupsTour"][1];

        let coupsTours = new Array();
        listeRoom[room]["coupsTour"] = coupsTours;

        // On dit à tous les joueurs sauf celui qui vient de jouer que l'un d'entre eux à joué
        for(let i = 0; i < listeRoom[room]["listeJoueurs"].length; i++){
            if(listeRoom[room]["listeJoueurs"][i].getPseudo() != joueurJouant){
                listeRoom[room]["listeJoueurs"][i].retenirCartesHumains(coup1, coup2)
            }
        }
        // Si les cartes ont les mêmes valeurs
        if(lesCartes[retournerIndexParPosition(coup1)].equals(lesCartes[retournerIndexParPosition(coup2)])){
            // On attend d'avoir retirer les deux cartes du jeu
            retirerCarte(coup1)
            retirerCarte(coup2)

            // On ajoute un au score du joueur
            listeRoom[room]["listeJoueurs"][indice].setScore(listeRoom[room]["listeJoueurs"][indice].getScore() + 1)


        }
        // Sinon
        else{
            // On retourne les deux cartes
            listeRoom[room]["cartes"][retournerIndexParPosition(coup1)].retournerCarte()
            listeRoom[room]["cartes"][retournerIndexParPosition(coup2)].retournerCarte()

            indice = (indice + 1) % 2;

        }

        if(listeRoom[room]["cartes"].length > 0){
            let lesJoueurs = Array(new JHumain(listeRoom[room]["listeJoueurs"][0]), new JHumain(listeRoom[room]["listeJoueurs"][1]));
            io.to(room).emit("finTour", listeJoueursEnString(lesJoueurs), listeCartesEnString(listeRoom[room]["cartes"]))
            
            joueurJouant = listeRoom[room]["listeJoueurs"][indice].getPseudo();

            if(indice == 0){
                setTimeout(() => {
                    listeRoom[room]["listeJoueurs"][0].emit("jouer");
                }, 3000) 
                listeRoom[room]["listeJoueurs"][1].emit("attendre");
            }
            else{
                listeRoom[room]["listeJoueurs"][0].emit("attendre");
                setTimeout(() => {
                    listeRoom[room]["listeJoueurs"][1].emit("jouer");
                }, 3000) 
            }  
        }
        else{
            let lesJoueurs = Array(new JHumain(listeRoom[room]["listeJoueurs"][0]), new JHumain(listeRoom[room]["listeJoueurs"][1]));
            io.to(room).emit("finPartie", listeJoueursEnString(lesJoueurs), listeCartesEnString(listeRoom[room]["cartes"]))
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
    for(let i = 0; i < listeRoom[room]["cartes"].length; i ++){
        // Si la Carte est présente dans la liste à l'indice i
        if(listeRoom[room]["cartes"][i].getPosition() == uneCarte){
            // On retire la carte
            listeRoom[room]["cartes"].splice(i, 1)
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
    for(let i = 0; i < listeRoom[room]["cartes"].length; i++){
        if(listeRoom[room]["cartes"][i].getPosition() == position){
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
    let listeCartes = new Array();

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

function listeCartesEnString(listeCartes){
    let retour = '';
    let array = new Array();
    let uneCarte;
    let arrayCarte;
    let strCarte;
    let i;

    for(i = 0 ; i < listeCartes.length ; i ++){
        uneCarte = listeCartes[i];

        arrayCarte = new Array(uneCarte.getPosition(), uneCarte.getValeur(), uneCarte.getEstRetournee());

        strCarte = JSON.stringify(arrayCarte);

        array.push(strCarte);

    }

    retour = JSON.stringify(array);

    return retour;
}

function listeJoueursEnString(listeJoueurs){
    let retour = '';
    let array = new Array()
    let unJoueur;
    let arrayJoueur;
    let strJoueur;
    let i;

    for(i = 0; i < listeJoueurs.length ; i ++){
        unJoueur = listeJoueurs[i];

        arrayJoueur = new Array(unJoueur.getPseudo(), unJoueur.getScore());

        strJoueur = JSON.stringify(arrayJoueur);

        array.push(strJoueur);
    }

    retour = JSON.stringify(array);

    return retour;
}