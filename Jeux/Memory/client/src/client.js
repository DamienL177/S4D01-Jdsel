import { Carte } from './Classes/Carte.js';
import {Memory} from './Classes/Memory.js'
import {JoueurHumain} from './Classes/typeJoueurs/joueurHumain.js'


const sock = io();

let leMemory = new Memory();
let joueur = new JoueurHumain("Joueur2");
let leChoixUn;

sock.on("error", (err) => {
    window.alert("Erreur "  + err)
})

sock.on("attendre", () => {
    desactiverBouton();
    var id = document.getElementById('affichage');
    id.innerText = "Ce n'est pas à votre tour.";
})

sock.on("jouer", () => {
    activerBouton();
    const bouton = document.querySelector("#leBoutonValider");
    bouton.addEventListener("click", () => {
        choixUn();
    })
    var id = document.getElementById('affichage');
    id.innerText = "C'est à votre tour.";
})

sock.on("afficher", (strListeJoueurs, strListeCartes) => {
    afficher(strListeJoueurs, strListeCartes);
})

sock.on("finTour", (strListeJoueurs, strListeCartes) => {
    finDeTour(strListeJoueurs, strListeCartes);
})

sock.on("connect", () => {
    sock.emit("Jconnecte");
})

async function finDeTour(strListeJoueurs, strListeCartes){
    await new Promise(r => setTimeout(r, 3000));
    afficher(strListeJoueurs, strListeCartes);
}

function afficher(strListeJoueurs, strListeCartes){
    leMemory.setMesJoueurs([]);
    let arrayJoueurs = JSON.parse(strListeJoueurs);
    let leJoueur;
    let arrayUnJoueur;
    let i;

    for(i = 0 ; i < arrayJoueurs.length ; i++){
        arrayUnJoueur = JSON.parse(arrayJoueurs[i]);
        leJoueur = new JoueurHumain(arrayUnJoueur[0]);
        leJoueur.setScore(arrayUnJoueur[1]);
        leMemory.ajouterJoueur(leJoueur);
    }

    leMemory.setMesCartes([]);
    let arrayCartes = JSON.parse(strListeCartes);
    let laCarte;
    let arrayUneCarte;

    for(i = 0 ; i < arrayCartes.length ; i++){
        arrayUneCarte = JSON.parse(arrayCartes[i]);
        laCarte = new Carte(arrayUneCarte[0], arrayUneCarte[1])
        leMemory.ajouterCarte(laCarte);
    }

    leMemory.afficherJeu();
}

function activerBouton(){
    const bouton = document.querySelector("#leBoutonValider");
    bouton.disabled = false;
}

function desactiverBouton(){
    const bouton = document.querySelector("#leBoutonValider");
    bouton.disabled = true;
}

async function choixUn(){
    let i;
    //window.alert("Le Choix Un");
    // On récupère la liste des positions valables
    let tableau = []

    for(i = 0; i < leMemory.getMesCartes().length; i ++){
        tableau.push(leMemory.getMesCartes()[i].getPosition())
    }

    // On récupère le choix du joueur quant à la position de la carte qu'il joue
    let leChoix = document.getElementById('leCoup').value
    //window.alert(tableau)

    // Si la liste des positions valables contient le texte saisi (s'il n'y a pas de problème de saisi comme AK)
    if(tableau.includes(leChoix)){

        // On place dans le stockage local quelle carte a été jouée
        localStorage.setItem("Coup1", leChoix)
        window.alert(typeof(leChoix))
        sock.emit("UnCoupJoue", leChoix);

        leChoixUn = leChoix;

        let article = document.getElementById("interaction");
        
        const bouton = document.querySelector("#leBoutonValider");
        bouton.remove();

        let nouveauBouton = document.createElement("bouton")
        nouveauBouton.setAttribute("type", "button");
        nouveauBouton.setAttribute("id", "leBoutonValider");
        nouveauBouton.setAttribute("class", "elementSaisie");
        nouveauBouton.disabled = false;
        nouveauBouton.innerText = "Valider";

        article.appendChild(nouveauBouton);

        nouveauBouton.addEventListener("click", () => {
            choixDeux();
        })

    }
    // Sinon
    else{
        // On récupère l'élément d'affichage puis on indique à l'utilisateur qu'il a fait une erreur
        let affichage = document.getElementById('affichage')
        affichage.textContent = "Veuillez saisir l'une des coordonnées affichées dans le tableau"
    }
}

async function choixDeux(){
    let i;
    //window.alert("Le Choix Deux");

    // On récupère la liste des positions valables
    let tableau = []

    for(i = 0; i < leMemory.getMesCartes().length; i ++){
        tableau.push(leMemory.getMesCartes()[i].getPosition())
    }

    // On récupère le choix du joueur quant à la position de la carte qu'il joue
    let leChoix = document.getElementById('leCoup').value
    //await new Promise(r => setTimeout(r, 250));

    //window.alert(leChoix);

    // Si la liste des positions valables contient le texte saisi (s'il n'y a pas de problème de saisi comme AK)
    if(tableau.includes(leChoix) && leChoix != leChoixUn){

        // On place dans le stockage local quelle carte a été jouée
        localStorage.setItem("Coup2", leChoix)

        sock.emit("UnCoupJoue", leChoix);

        sock.emit("TourFini");

        let article = document.getElementById("interaction");
        
        const bouton = document.querySelector("#leBoutonValider");
        bouton.remove();

        let nouveauBouton = document.createElement("bouton")
        nouveauBouton.setAttribute("type", "button");
        nouveauBouton.setAttribute("id", "leBoutonValider");
        nouveauBouton.setAttribute("class", "elementSaisie");
        nouveauBouton.disabled = true;
        nouveauBouton.innerText = "Valider";

        article.appendChild(nouveauBouton);

        nouveauBouton.addEventListener("click", () => {
            choixDeux();
        })

    }
    // Sinon
    else{
        // On récupère l'élément d'affichage puis on indique à l'utilisateur qu'il a fait une erreur
        let affichage = document.getElementById('affichage')
        affichage.textContent = "Veuillez saisir l'une des coordonnées affichées dans le tableau"
    }
}