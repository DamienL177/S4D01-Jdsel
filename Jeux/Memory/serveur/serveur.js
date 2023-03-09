const Joueur = require('../client/src/nodeClasses/Joueur.mjs');
const JHumain = require('../client/src/nodeClasses/typeJoueurs/joueurHumain.mjs');
const tCarte = require('../client/src/nodeClasses/Carte.mjs');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const Carte = require('../client/src/nodeClasses/Carte.mjs');
const mysql = require('mysql');

const app = express();

const clientPath = __dirname + '/../client/src';

app.use(express.static(clientPath));

const server = http.createServer(app);

const io = socketio(server);


let listeRoom = {};

io.on('connection', (sock) => {
    
    sock.on("Jconnecte", async (room, pseudoJoueur) => {
        if(!(room in listeRoom)){
            let nomRoom = room;
            let joueursDansRoom = [pseudoJoueur];
            let socksDansRoom = [sock];
            let scoresJoueurs = [0, 0];
            let lesCartes = initCartes();
            let coupsTours = [];
            let uneRoom = [];
            let indice = 0;
            uneRoom["nom"] = room;
            uneRoom["listeJoueurs"] = joueursDansRoom;
            uneRoom["listeSocks"] = socksDansRoom;
            uneRoom["scoresJoueurs"] = scoresJoueurs;
            uneRoom["cartes"] = lesCartes;
            uneRoom["coupsTour"] = coupsTours;
            listeRoom[room] = uneRoom;
            sock.join(room);
            sock.emit("attendre");
            console.log("Premier utilisateur connecté");
        }
        else{
            if(listeRoom[room]["listeSocks"].length < 2){
                debutPartieBD(room);

                listeRoom[room]["listeJoueurs"][1] = pseudoJoueur;
                listeRoom[room]["listeSocks"][1] = sock;
                sock.join(room);
                sock.emit("attendre");
        
                console.log("Deuxieme utilisateur connecté");

                let lesJoueurs = Array(new JHumain(listeRoom[room]["listeJoueurs"][0]), new JHumain(listeRoom[room]["listeJoueurs"][1]));
                listeRoom[room]["scoresJoueurs"][0] = 0;
                listeRoom[room]["scoresJoueurs"][1] = 0;
                var idJ1;
                var idJ2;
                idJ1 = await getIdFromPseudo(listeRoom[room]["listeJoueurs"][0]);
                idJ2 = await getIdFromPseudo(listeRoom[room]["listeJoueurs"][1]);
                await new Promise(resolve => {
                    var idInterval = setInterval(() => {
                        if(typeof(idJ1) != "undefined" && typeof(idJ2) != "undefined"){
                            resolve();
                            clearInterval(idInterval);
                        }
                    }, 250)
                })
                listeRoom[room]["idJoueurs"] = [idJ1, idJ2];

                io.to(room).emit("afficher", listeJoueursEnString(lesJoueurs), listeCartesEnString(listeRoom[room]["cartes"]))
                
                indice = Math.floor(Math.random() * 2);
                listeRoom[room]["indice"] = indice;
        
                let joueur = listeRoom[room]["listeSocks"][indice];
                joueur.emit("jouer");
            }
            
        }
    })

    sock.on("error", (err) => {
        console.log("Une erreur s'est produite :" + err)
    })

    sock.on("UnCoupJoue", (room, coup) => {
        //console.log(coup)
        let i;
        for(i = 0; i < listeRoom[room]['cartes'].length; i++){
            //console.log(lesCartes[i].getPosition())
            if(listeRoom[room]['cartes'][i].getPosition() == coup){
                //console.log("OK");
                listeRoom[room]["cartes"][i].retournerCarte();
                let lesJoueurs = Array(new JHumain(listeRoom[room]["listeJoueurs"][0]), new JHumain(listeRoom[room]["listeJoueurs"][1]));
                io.to(room).emit("afficher", listeJoueursEnString(lesJoueurs), listeCartesEnString(listeRoom[room]["cartes"]))
                listeRoom[room]["coupsTour"].push(coup);
                break;
            }
        }

        
    })

    sock.on("TourFini", (room) => {
        // On récupère les indexs des coups du joueur
        let coup1 = listeRoom[room]["coupsTour"][0];
        let coup2 = listeRoom[room]["coupsTour"][1];

        let coupsTours = [];
        listeRoom[room]["coupsTour"] = coupsTours;

        // Si les cartes ont les mêmes valeurs
        if(listeRoom[room]["cartes"][retournerIndexParPosition(room, coup1)].equals(listeRoom[room]["cartes"][retournerIndexParPosition(room, coup2)])){
            // On attend d'avoir retirer les deux cartes du jeu
            retirerCarte(room, coup1)
            retirerCarte(room, coup2)

            // On ajoute un au score du joueur
            listeRoom[room]["scoresJoueurs"][listeRoom[room]["indice"]] = listeRoom[room]["scoresJoueurs"][listeRoom[room]["indice"]] + 1


        }
        // Sinon
        else{
            // On retourne les deux cartes
            listeRoom[room]["cartes"][retournerIndexParPosition(room, coup1)].retournerCarte()
            listeRoom[room]["cartes"][retournerIndexParPosition(room, coup2)].retournerCarte()

            listeRoom[room]["indice"] = (listeRoom[room]["indice"] + 1) % 2;

        }

        if(listeRoom[room]["cartes"].length > 0){
            let lesJoueurs = Array(new JHumain(listeRoom[room]["listeJoueurs"][0]), new JHumain(listeRoom[room]["listeJoueurs"][1]));
            lesJoueurs[0].setScore(listeRoom[room]["scoresJoueurs"][0])
            lesJoueurs[1].setScore(listeRoom[room]["scoresJoueurs"][1])
            io.to(room).emit("finTour", listeJoueursEnString(lesJoueurs), listeCartesEnString(listeRoom[room]["cartes"]))
            
            joueurJouant = listeRoom[room]["listeJoueurs"][listeRoom[room]["indice"]];

            if(listeRoom[room]["indice"] == 0){
                let joueur1 = listeRoom[room]["listeSocks"][0];
                setTimeout(() => {
                    joueur1.emit("jouer");
                }, 3000) 
                let joueur2 = listeRoom[room]["listeSocks"][1];
                joueur2.emit("attendre");
            }
            else{
                let joueur1 = listeRoom[room]["listeSocks"][0];
                joueur1.emit("attendre");
                let joueur2 = listeRoom[room]["listeSocks"][1];
                setTimeout(() => {
                    joueur2.emit("jouer");
                }, 3000) 
            }  
        }
        else{
            let lesJoueurs = Array(new JHumain(listeRoom[room]["listeJoueurs"][0]), new JHumain(listeRoom[room]["listeJoueurs"][1]));
            io.to(room).emit("finPartie", listeJoueursEnString(lesJoueurs), listeCartesEnString(listeRoom[room]["cartes"]))
            finPartieBD(room)
        }   

    })

    sock.on("EnvoiMessage", (room, message, pseudo) => {
        //console.log(pseudo);
        io.to(room).emit("RetourMessage", (message, pseudo));
        var index;
        if(listeRoom[room]["listeJoueurs"][0] == pseudo){
            index = 0;
        }
        else{
            index = 1;
        }
        var indice = (0 + 1) % 2;
        var idJEnvoi = listeRoom[room]["idJoueurs"][index];
        var idJRetour = listeRoom[room]["idJoueurs"][indice];
        messageDansBD(message, idJEnvoi, idJRetour, room);
    })

})


server.on('error', (err) => {
    console.error('Server error:', err);
})
server.listen(8080, () => {
    console.log('On écoute sur le port 8080');
})

// On retire une carte de la liste mesCartes
function retirerCarte(room, uneCarte){
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
function retournerIndexParPosition(room, position){
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

function debutPartieBD(room){
    let connection = mysql.createConnection({
        host: 'localhost',
        user: 'Grp4',
        password: 'u=5#5^xvcGEoKdq0>E',
        database: 'Jdsel'
    });

    connection.connect(function(err) {
        if (err) {
          window.alert("Problème de connection à la Base de Données");
          throw(err);
        }
      
        return connection;
    });

    let requete = "UPDATE Partie SET estCommencee = TRUE WHERE identifiant = '" + room + "';";
    connection.query(requete, (error, results, fields) => {
        if(error){
            console.log(console.error(error.message));
        }
    })

    
    connection.end(function(err) {
        if (err) {
            return console.log('error:' + err.message);
        }
        //console.log('Close the database connection.');
    });
}

function finPartieBD(room){
    let connection = mysql.createConnection({
        host: 'localhost',
        user: 'Grp4',
        password: 'u=5#5^xvcGEoKdq0>E',
        database: 'Jdsel'
    });

    connection.connect(function(err) {
        if (err) {
          window.alert("Problème de connection à la Base de Données");
          throw(err);
        }
      
        return connection;
    });

    let requete = "UPDATE Partie SET estFini = TRUE WHERE identifiant = '" + room + "';";
    connection.query(requete, (error, results, fields) => {
        if(error){
            console.log(console.error(error.message));
        }
    })

    
    connection.end(function(err) {
        if (err) {
            return console.log('error:' + err.message);
        }
        //console.log('Close the database connection.');
    });
}


async function getIdFromPseudo(pseudo){
    let identifiant;
    let connection = mysql.createConnection({
        host: 'localhost',
        user: 'Grp4',
        password: 'u=5#5^xvcGEoKdq0>E',
        database: 'Jdsel'
    });

    connection.connect(function(err) {
        if (err) {
          window.alert("Problème de connection à la Base de Données");
          throw(err);
        }
      
        return connection;
    });

    let requete = "SELECT identifiant FROM Joueur WHERE pseudonyme = '" + pseudo + "';";
    //console.log(requete);
    connection.query(requete, (error, results, fields) => {
        if(error){
            console.log(console.error(error.message));
        }

        identifiant = results[0].identifiant;
        //console.log(identifiant);
    })

    
    connection.end(function(err) {
        if (err) {
            return console.log('error:' + err.message);
        }
        //console.log('Close the database connection.');
    });


    await new Promise(resolve => {
        var idInterval = setInterval(() => {
            if(typeof(identifiant) != "undefined"){
                resolve();
                clearInterval(idInterval);
            }
        }, 250)
    })

    return identifiant;

}

function messageDansBD(contenu, idJEnvoi, idJRetour, idPartie){
    var today = new Date();
    var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
    var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    var dateTime = date+' '+time;

    let connection = mysql.createConnection({
        host: 'localhost',
        user: 'Grp4',
        password: 'u=5#5^xvcGEoKdq0>E',
        database: 'Jdsel'
    });

    connection.connect(function(err) {
        if (err) {
          window.alert("Problème de connection à la Base de Données");
          throw(err);
        }
      
        return connection;
    });
    contenu = contenu.replace("'", "''");
    let requete = "INSERT INTO Message VALUES(NULL, '" + contenu + "','" + dateTime + "', FALSE, '" + idJEnvoi + "','" + idJRetour + "','" + idPartie + "');";
    //console.log(requete);
    connection.query(requete, (error, results, fields) => {
        if(error){
            console.log(console.error(error.message));
        }
    })

    
    connection.end(function(err) {
        if (err) {
            return console.log('error:' + err.message);
        }
        //console.log('Close the database connection.');
    });
}

