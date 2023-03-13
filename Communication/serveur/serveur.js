const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const mysql = require('mysql');

const app = express();

const clientPath = __dirname + './../client/';

app.use(express.static(clientPath));

const serveur = http.createServer(app);

const io = socketio(serveur);

io.on('connection', (sock) => {
    sock.on("Uconnecte", async (pseudoJoueur) => {
        //console.log("Uconnecte");
        var idJoueur = await getIdFromPseudo(pseudoJoueur);
        var listeAmis = await getAmis(idJoueur);
        sock.emit("listeAmis", listeAmis);
    })

    sock.on("Recherche", async (monPseudo, saisie) => {
        var listeJoueurs = await rechercherJoueurs(monPseudo, saisie);
        sock.emit("rechercheJoueurs", listeJoueurs);
    })

    sock.on("Demande ami", async (monPseudo, pseudoAmi) => {
        var monId = await getIdFromPseudo(monPseudo);
        var idAmi = await getIdFromPseudo(pseudoAmi);
        var inutile = await demandeAmis(monId, idAmi);
    })

    sock.on("En Demande", async (monPseudo) => {
        var monId = await getIdFromPseudo(monPseudo);
        var lesDemandes = await enDemande(monId);
        sock.emit("lesDemandes", lesDemandes);
    })

    sock.on("RefusDemande", async (idAmis) => {
        refuserDemande(idAmis);
    })

    sock.on("AccepteDemande", async (idAmis) => {
        accepterDemande(idAmis);
    })

    sock.on("ChoixAmi", async (monPseudo, pseudoAmi) => {
        var monId = await getIdFromPseudo(monPseudo);
        var idAmi = await getIdFromPseudo(pseudoAmi);
        var idAmis = await retourIdAmis(monId, idAmi);
        var nomRoom = "room" + idAmis;
        sock.join(nomRoom);
        var messages = await recupererMessages(monId, idAmi);
        sock.emit("OuvertureConversation", nomRoom, messages, pseudoAmi);

    })

    sock.on("EnvoiMessage", async (room, message, monPseudo, pseudoAmi) => {
        let contenu = message;
        io.to(room).emit("RetourMessage", contenu, monPseudo);
        var idJEnvoi = await getIdFromPseudo(monPseudo);
        var idJRetour = await getIdFromPseudo(pseudoAmi);
        messageDansBD(message, idJEnvoi, idJRetour);
    })

    sock.on("Mes Amis", async(pseudoJoueur) => {
        var idJoueur = await getIdFromPseudo(pseudoJoueur);
        var listeAmis = await getAmis(idJoueur);
        sock.emit("listeAmis", listeAmis);
    })
})

serveur.on('error', (err) => {
    console.error('Server error:', err);
})
serveur.listen(8888, () => {
    console.log('On écoute sur le port 8888');
})

async function getIdFromPseudo(pseudo){
    let identifiant;
    let estFini = false;
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

        if(results[0].identifiant != undefined){
            identifiant = results[0].identifiant;
            estFini = true;
        }
        else{
            identifiant = null;
            estFini = true;
        }
        
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
            if(estFini){
                resolve();
                clearInterval(idInterval);
            }
        }, 250)
    })

    return identifiant;

}

async function getAmis(idJoueur){
    //console.log("Je cherche mes amis");
    var listeAmis = new Array();
    var estFini = false;
    var unId;
    var unPseudo;
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

    let requete = "SELECT idAmis, idJoueur2 as idJoueur FROM Amis WHERE idJoueur1 = '" + idJoueur + "' AND enDemande = FALSE;";
    //console.log(requete);
    connection.query(requete, (error, results, fields) => {
        if(error){
            console.log(console.error(error.message));
        }

        if(results.length == 0){
            estFini = true;
        }

        for(var i = 0; i < results.length; i ++){
            listeAmis.push([results[i].idAmis, results[i].idJoueur]);
            if(i == results.length - 1){
                estFini = true;
            }
        }
        //console.log(identifiant);
    })

    await new Promise(resolve => {
        var idInterval = setInterval(() => {
            if(estFini){
                estFini = false;
                resolve();
                clearInterval(idInterval);
            }
        }, 250)
    })

    requete = "SELECT idAmis, idJoueur1 as idJoueur FROM Amis WHERE idJoueur2 = '" + idJoueur + "' AND enDemande = FALSE;";
    //console.log(requete);
    connection.query(requete, (error, results, fields) => {
        if(error){
            console.log(console.error(error.message));
        }

        if(results.length == 0){
            estFini = true;
        }

        for(var i = 0; i < results.length; i ++){
            listeAmis.push([results[i].idAmis, results[i].idJoueur]);
            if(i == results.length - 1){
                estFini = true;
            }
        }
        //console.log(identifiant);
    })

    await new Promise(resolve => {
        var idInterval = setInterval(() => {
            if(estFini){
                estFini = false;
                resolve();
                clearInterval(idInterval);
            }
        }, 250)
    })
    
    connection.end(function(err) {
        if (err) {
            return console.log('error:' + err.message);
        }
        //console.log('Close the database connection.');
    });

    for(var j = 0; j < listeAmis.length; j ++){
        unId = listeAmis[j][1];
        unPseudo = await getpseudoFromId(unId);
        listeAmis[j][1] = unPseudo;
        if(j == listeAmis.length - 1){
            estFini = true;
        }
    }

    await new Promise(resolve => {
        var idInterval = setInterval(() => {
            if(estFini){
                resolve();
                clearInterval(idInterval);
            }
        }, 250)
    })

    return listeAmis;

}

async function getpseudoFromId(identifiant){
    let pseudonyme;
    let estFini = false;
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

    let requete = "SELECT pseudonyme FROM Joueur WHERE identifiant = '" + identifiant + "';";
    //console.log(requete);
    connection.query(requete, (error, results, fields) => {
        if(error){
            console.log(console.error(error.message));
        }

        if(results[0].pseudonyme != undefined){
            pseudonyme = results[0].pseudonyme;
            estFini = true;
        }
        else{
            pseudonyme = null;
            estFini = true;
        }
        
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
            if(estFini){
                resolve();
                clearInterval(idInterval);
            }
        }, 250)
    })

    return pseudonyme;

}

async function rechercherJoueurs(monPseudo, pseudo){
    //console.log("Recherche Joueur");
    let listeJoueurs = new Array();
    let estFini = false;

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

    let requete = "SELECT pseudonyme FROM Joueur WHERE pseudonyme LIKE '" + pseudo + "%' AND pseudonyme <> '" + monPseudo + "';";
    //console.log(requete);
    connection.query(requete, (error, results, fields) => {
        if(error){
            console.log(console.error(error.message));
        }

        for(var i = 0; i < results.length; i ++){
            listeJoueurs.push(results[i].pseudonyme);
            if(i == results.length - 1){
                estFini = true;
            }
        }
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
            if(estFini){
                resolve();
                clearInterval(idInterval);
            }
        }, 250)
    })

    return listeJoueurs;
}

async function retourIdAmis(monId, idAmi){
    var identifiant;
    var estFini = false;

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

    let requete = "SELECT idAmis FROM Amis WHERE (idJoueur1 = '" + monId + "' AND idJoueur2 = '" + idAmi + "') OR (idJoueur1 = '" + idAmi + "' AND idJoueur2 = '" + monId + "');";
    //console.log(requete);
    connection.query(requete, (error, results, fields) => {
        if(error){
            console.log(console.error(error.message));
        }

        if(results.idAmis != undefined){  
            identifiant = results.idAmis;
            estFini = true;
        }
        else{
            identifiant == null;
            estFini = true;
        }
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
            if(estFini){
                resolve();
                clearInterval(idInterval);
            }
        }, 250)
    })

    return identifiant;
}

async function recupererMessages(monId, idAmi){
    //console.log("Choix ami");
    let listeMessages = new Array();
    let estFini = false;

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

    let requete = "SELECT contenu, idJEnvoi FROM Message WHERE ((idJEnvoi = '" + monId + "' AND idJRetour = '" + idAmi + "') OR (idJEnvoi = '" + idAmi + "' AND idJRetour = '" + monId + "')) AND estAccessible = TRUE ORDER BY dateMessage DESC LIMIT 20;";
    //console.log(requete);
    connection.query(requete, (error, results, fields) => {
        if(error){
            console.log(console.error(error.message));
        }

        if(results.length == 0){
            estFini = true;
        }

        for(var i = 0; i < results.length; i ++){
            listeMessages.push([results[i].contenu, results[i].idJEnvoi]);
            if(i == results.length - 1){
                estFini = true;
            }
        }
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
            if(estFini){
                resolve();
                clearInterval(idInterval);
            }
        }, 250)
    })

    for(var j = 0; j < listeMessages.length; j ++ ){
        listeMessages[j][1] = await getpseudoFromId(listeMessages[j][1]);
    }
    
    return listeMessages;
}

async function demandeAmis(monId, autreId){
    //console.log("Demande d'ami")
    var idAmis = await retourIdAmis(monId, autreId);

    if(idAmis == null){

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
        let requete = "INSERT INTO Amis VALUES(NULL, '" + monId + "','" + autreId + "', TRUE);";
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
        
        return Promise.resolve();
    }
    else{
        return Promise.resolve();
    }
}

async function enDemande(monId){
    //console.log("Les demandes d'amis");
    var estFini = false;
    let lesDemandes = new Array();

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
    let requete = "SELECT idAmis, idJoueur1 AS idJoueur FROM Amis WHERE idJoueur2 = '" + monId + "' AND enDemande = TRUE;";
    //console.log(requete);
    connection.query(requete, (error, results, fields) => {
        if(error){
            console.log(console.error(error.message));
        }

        for(var i = 0; i < results.length; i ++){
            lesDemandes.push([results[i].idAmis,results[i].idJoueur]);
            if(i == results.length - 1){
                estFini = true;
            }
        }

    })

    
    connection.end(function(err) {
        if (err) {
            return console.log('error:' + err.message);
        }
        //console.log('Close the database connection.');
    });

    await new Promise(resolve => {
        var idInterval = setInterval(() => {
            if(estFini){
                resolve();
                clearInterval(idInterval);
            }
        }, 250)
    })

    for(var j = 0; j < lesDemandes.length; j++){
        lesDemandes[j][1] = await getpseudoFromId(lesDemandes[j][1]);
    }

    return lesDemandes;
}

function refuserDemande(idAmis){
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
    let requete = "DELETE FROM Amis WHERE idAmis = '" + idAmis +"';";
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

function accepterDemande(idAmis){
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

    let requete = "UPDATE Amis SET enDemande = FALSE WHERE idAmis = '" + idAmis + "';";
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

function messageDansBD(contenu, idJEnvoi, idJRetour){
    //console.log("Envoi message");
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
    let requete = "INSERT INTO Message VALUES(NULL, '" + contenu + "','" + dateTime + "', TRUE, '" + idJEnvoi + "','" + idJRetour + "', NULL);";
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