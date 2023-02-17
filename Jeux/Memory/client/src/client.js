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

sock.on("afficher", (lesJoueurs, lesCartes) => {
    leMemory.setMesJoueurs(lesJoueurs);
    leMemory.setMesCartes(lesCartes);
    leMemory.afficherJeu();
})

sock.on("connect", () => {
    sock.emit("Jconnecte");
})

function activerBouton(){
    const bouton = document.querySelector("#leBoutonValider");
    bouton.disabled = false;
}

function desactiverBouton(){
    const bouton = document.querySelector("#leBoutonValider");
    bouton.disabled = true;
}

function choixUn(){
    let i;

    // On récupère la liste des positions valables
    let tableau = []

    for(i = 0; i < leMemory.getMesCartes().length; i ++){
        tableau.push(leMemory.getMesCartes()[i].getPosition())
    }

    // On récupère le choix du joueur quant à la position de la carte qu'il joue
    let leChoix = document.getElementById('leCoup').value

    // Si la liste des positions valables contient le texte saisi (s'il n'y a pas de problème de saisi comme AK)
    if(tableau.includes(leChoix)){

        // On place dans le stockage local quelle carte a été jouée
        localStorage.setItem("Coup1", leChoix)

        sock.emit("UnCoupJoue", leChoix);

        leChoixUn = leChoix;

        const bouton = document.querySelector("#leBoutonValider");
        bouton.addEventListener("click", () => {
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

function choixDeux(){
    let i;

    // On récupère la liste des positions valables
    let tableau = []

    for(i = 0; i < leMemory.getMesCartes().length; i ++){
        tableau.push(leMemory.getMesCartes()[i].getPosition())
    }

    // On récupère le choix du joueur quant à la position de la carte qu'il joue
    let leChoix = document.getElementById('leCoup').value

    // Si la liste des positions valables contient le texte saisi (s'il n'y a pas de problème de saisi comme AK)
    if(tableau.includes(leChoix) && leChoix != leChoixUn){

        // On place dans le stockage local quelle carte a été jouée
        localStorage.setItem("Coup2", leChoix)

        sock.emit("UnCoupJoue", leChoix);

        sock.emit("TourFini");

        desactiverBouton();

    }
    // Sinon
    else{
        // On récupère l'élément d'affichage puis on indique à l'utilisateur qu'il a fait une erreur
        let affichage = document.getElementById('affichage')
        affichage.textContent = "Veuillez saisir l'une des coordonnées affichées dans le tableau"
    }
}