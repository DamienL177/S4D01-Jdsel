const valeursURL =  window.location.search;
const paramsURL = new URLSearchParams(valeursURL);
var pseudoJoueur;
if(paramsURL.has('pseudojoueur')){
    pseudoJoueur = paramsURL.get('pseudojoueur');
}
else{
    window.location.replace("../../index.html");
}

const sock = io();

var room;
var pseudoAutreJoueur;

var partiePrincipale = document.getElementById("partiePrincipale");

var lesRecherches;
var lesAmis;
var lesDemandes;

sock.on("error", (err) => {
    window.alert("Erreur "  + err)
})

sock.on("connect", () => {
    sock.emit("Uconnecte", pseudoJoueur);
    var saisieRecherche = document.getElementById("saisiePseudo");
    saisieRecherche.addEventListener("keypress", function(event) {
        if(event.key == "Enter"){
            event.preventDefault();
        }
    });
    var boutonRecherche = document.getElementById("boutonRecherche");
    boutonRecherche.onclick = function () {chercherJoueur();};
    var bouton = document.getElementById("demandesAmi");
    bouton.onclick = function() {visualiserDemandes();};
    setInterval(()=>{
        sock.emit("Mes Amis", pseudoJoueur);
    }, 5000);
})

sock.on("listeAmis", (listeAmis) => {
    lesAmis = listeAmis;
    var affichage = document.getElementById('mesAmis');
    affichage.innerHTML = "";
    var unDiv;
    var unBouton;
    for(var i = 0; i < listeAmis.length ; i++){
        unDiv = document.createElement("div");
        unBouton = document.createElement("button");
        unBouton.type= "button";
        unBouton.innerText = listeAmis[i][1];
        unBouton.setAttribute("indice", i);
        unBouton.addEventListener('click', (e) => {
            var indice = e.currentTarget.getAttribute("indice");
            sock.emit("ChoixAmi", pseudoJoueur, lesAmis[indice][1]);
        });
        unDiv.appendChild(unBouton);
        unDiv.classList.add('unAmi');
        affichage.appendChild(unDiv);
    }
})

sock.on("rechercheJoueurs", (listeJoueurs)=>{
    lesRecherches = listeJoueurs;
    partiePrincipale.innerHTML = "";
    var unDiv;
    var unPseudo;
    var unBouton;
    for(var i = 0; i < listeJoueurs.length; i++){
        unDiv = document.createElement("div");
        unDiv = document.createElement("div");
        unPseudo = document.createElement("h3");
        unPseudo.innerText = listeJoueurs[i];
        unBouton = document.createElement("button");
        unBouton.type = "button";
        unBouton.innerText = "Demander en ami";
        unBouton.setAttribute("indice", i);
        unBouton.addEventListener('click', (e) => {
            var indice = e.currentTarget.getAttribute("indice");
            sock.emit("Demande ami", pseudoJoueur, lesRecherches[indice]);
            location.reload();
        });
        unDiv.appendChild(unPseudo);
        unDiv.appendChild(document.createElement("br"));
        unDiv.appendChild(unBouton);
        unDiv.classList.add('unJoueur')
        partiePrincipale.appendChild(unDiv)
    }
})

sock.on("lesDemandes", (mesDemandes) => {
    lesDemandes = mesDemandes;
    partiePrincipale.innerHTML = "";
    var unDiv;
    var unPseudo;
    var boutonAccepter;
    var boutonRefuser;
    for(var i = 0; i < mesDemandes.length; i++){
        unDiv = document.createElement("div");
        unPseudo = document.createElement("h3");
        unPseudo.innerText = mesDemandes[i][1];
        boutonAccepter = document.createElement("button");
        boutonAccepter.type = "button";
        boutonAccepter.innerText = "Accepter";
        boutonAccepter.setAttribute("indice", i);
        boutonAccepter.addEventListener('click', (e) => {
            var indice = e.currentTarget.getAttribute("indice");
            sock.emit("AccepteDemande", lesDemandes[indice][0]);
            location.reload();
        });
        boutonRefuser = document.createElement("button");
        boutonRefuser.type = "button";
        boutonRefuser.innerText = "Refuser";
        boutonRefuser.setAttribute("indice", i);
        boutonRefuser.addEventListener('click', (e) => {
            var indice = e.currentTarget.getAttribute("indice");
            sock.emit("RefusDemande", lesDemandes[indice][0]);
            location.reload();
        });
        unDiv.appendChild(unPseudo);
        unDiv.appendChild(document.createElement("br"));
        unDiv.appendChild(boutonAccepter);
        unDiv.appendChild(boutonRefuser);
        unDiv.classList.add('uneDemande');
        partiePrincipale.appendChild(unDiv)
    }
})

sock.on("OuvertureConversation", (nomRoom, messages, pseudoAmi) => {
    pseudoAutreJoueur = pseudoAmi;
    room = nomRoom;
    partiePrincipale.innerHTML = "";
    var premierArticle = document.createElement("article");
    premierArticle.id = "messages";
    var secondArticle = document.createElement("article");
    secondArticle.id = "saisie";
    var unDiv;
    var unPseudo;
    var unMessage;
    for(var i = messages.length; i >= 0; i--){
        unDiv = document.createElement("div");
        unPseudo = document.createElement("h3");
        unPseudo.innerText = messages[i][1];
        unMessage = document.createElement("p");
        unMessage.innerText = messages[i][0];
        unDiv.appendChild(unPseudo);
        unDiv.appendChild(unMessage);
        unDiv.classList.add('unMessage');
        premierArticle.appendChild(unDiv);
    }
    var unForm = document.createElement("form");
    var unBouton = document.createElement("button");
    unBouton.type = "button";
    unBouton.onclick = function () {envoiMessage();};
    unBouton.innerText = "=>";
    var unInput = document.createElement("input");
    unInput.type = "text";
    unInput.id= "inputMessage";
    unInput.addEventListener("keypress", function(event) {
        if(event.key == "Enter"){
            event.preventDefault();
            document.getElementById('envoiMessage').click();
        }
    })    
    unForm.appendChild(unInput);
    unForm.appendChild(unBouton);
    unForm.classList.add('formSaisieMessages');
    secondArticle.appendChild(unForm);    
    partiePrincipale.appendChild(premierArticle);
    partiePrincipale.appendChild(secondArticle);

})

sock.on("RetourMessage", (message, pseudo) => {
    var articleMessage = document.getElementById("messages");
    var unDiv;
    var unPseudo;
    var contenu;
    unDiv = document.createElement("div");
    unPseudo = document.createElement("h3");
    unPseudo.innerText = pseudo + " : ";
    contenu = document.createElement("p");
    contenu.innerText = message;
    unDiv.appendChild(unPseudo);
    unDiv.appendChild(document.createElement("br"));
    unDiv.appendChild(contenu);
    unDiv.classList.add('unMessage');
    articleMessage.appendChild(unDiv);
})

function chercherJoueur(){
    var saisieRecherche = document.getElementById("saisiePseudo");
    var laSaisie = saisieRecherche.value;
    sock.emit("Recherche", pseudoJoueur, laSaisie);
}

function visualiserDemandes(){
    sock.emit("En Demande", pseudoJoueur);
}

function envoiMessage(){
    var inputMessage = document.getElementById("inputMessage");
    var saisie = inputMessage.value;
    sock.emit("EnvoiMessage", room, saisie, pseudoJoueur, pseudoAutreJoueur);
}