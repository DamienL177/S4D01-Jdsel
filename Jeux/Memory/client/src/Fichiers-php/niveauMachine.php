<?php

    ini_set('display_errors', 1);
    ini_set('display_startup_errors', 1);
    error_reporting(E_ALL);

    // Si on connait le niveau de la machine
    if(isset($_POST['lvlMachine'])){
        // On récupère le niveau de la machine
        $niveauMachine = $_POST['lvlMachine'];

        // On renvoit vers la page main.html
        header("Refresh:0.1; url=../index.html");

        // On place le niveau de la machine dans une variable locale javascript
        print "<script type='text/javascript'>localStorage.setItem('nivMachine', '$niveauMachine')</script>";
        print "
        <script type='module'>
            if(localStorage.getItem('nivMachine') === null){
                window.location.replace('formulaireDifficulteBot.html')
            }
            import {Memory} from './Classes/Memory.js';
            import {JoueurHumain} from './Classes/typeJoueurs/joueurHumain.js';
            import {MachineFacile} from './Classes/typeJoueurs/typeMachines/machineFacile.js';
            import {MachineMoyen} from './Classes/typeJoueurs/typeMachines/machineMoyen.js';
            import {MachineDifficile} from './Classes/typeJoueurs/typeMachines/machineDifficile.js';
            let leMemory = new Memory();
            let unJoueur = new JoueurHumain(localStorage.getItem('PseudoJ1'));
            unJoueur.lierMonMemory(leMemory);
            let typeJoueur = localStorage.getItem('nivMachine');
            let deuxJoueur 
            switch(typeJoueur){
                case 'none':
                    deuxJoueur = new JoueurHumain(localStorage.getItem('PseudoJ2'));
                    break;
                case 'Facile':
                    deuxJoueur = new MachineFacile(localStorage.getItem('PseudoJ2'));
                    deuxJoueur.lierMonMemory(leMemory);
                    leMemory.jouerJeu();
                    break;
                case 'Moyen':
                    deuxJoueur = new MachineMoyen(localStorage.getItem('PseudoJ2'));
                    deuxJoueur.lierMonMemory(leMemory);
                    leMemory.jouerJeu();
                    break;
                case 'Difficile':
                    deuxJoueur = new MachineDifficile(localStorage.getItem('PseudoJ2'));
                    deuxJoueur.lierMonMemory(leMemory);
                    leMemory.jouerJeu();
                    break;
            }";
    }
    else{

        // On définit les variables nécessaires au lien avec la BD
        $bdd = "Jdsel";
        $host = "localhost";
        $user= "Grp4";
        $pass = "u=5#5^xvcGEoKdq0>E";

        // On définit les variables nécessaires à la commande
        $nomtable = "Partie";
        $laDate = date("Y-m-d H:i:s");
        $estCommencee = FALSE;
        $estFinie = FALSE;

        // On définit les variables nécessaires au calcul de l'identifiant
        $charsId = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';    // Les caractères pouvant être utilisés
        $tabCharsId = str_split($charsId);      // Un tableau des caractères pouvant être utilisés
        $idOK = false;      // La variable nous permettant de rester dans la boucle while

        // On fait le lien avec la BD
        $link = mysqli_connect($host,$user,$pass,$bdd);

        if (mysqli_connect_errno()){
            echo "<p>Problème de connect : " , mysqli_connect_error() ,"</p>";
            throw new Exception();
        }

        
        if(isset($_SESSION['idPlayer'])){
            $idJoueur = $_SESSION['idPlayer'];
            $tableJoueur = "Joueur";
            $query = "SELECT pseudonyme FROM $tableJoueur WHERE identifiant = '$idJoueur'";
            $result = mysqli_query($link, $query);
            $row = mysqli_fetch_array($result);
            $pseudoJoueur = $row['pseudonyme'];
        }

        // Tant que nous n'avons pas un identifiant OK
        while(!$idOK){
            // On définit l'identifiant
            $identifiant = '';
            // On le remplit avec 16 caractères aléatoires parmi les caractères possibles
            for($i = 0; $i < 10; $i++){
                $index = array_rand($tabCharsId);
                $identifiant .= $tabCharsId[$index];
            }
            // On compte le nombre d'identifiants similaires
            $query = "SELECT COUNT(*) as nbId FROM $nomtable WHERE identifiant = '$identifiant'";
            $result = mysqli_query($link, $query);
            $row = mysqli_fetch_array($result);

            // S'il n'y en a pas on sort de la boucle
            if($row['nbId'] == 0){
                $idOK = true;
            }
        }

        // On créé la requête et on lance l'insertion d'un Joueur dans la base
        $query = "INSERT INTO $nomtable VALUES('$identifiant', '$laDate', $estCommencee, $estFinie, NULL, NULL)";
        $result = mysqli_query($link, $query);

        if (mysqli_connect_errno()){
            echo "<p>Problème de query : " , mysqli_connect_error() ,"</p>";
            throw new Exception();
        }

        // On ferme le lien avec la BD
        mysqli_close($link);

        // Si l'insertion est réussie on continue
        if($result == true){
            $url = "http://153.92.211.90:8080/?idpartie=" . $identifiant;
            if(isset($pseudoJoueur)){
                $url = $url . "&pseudojoueur=" . $pseudoJoueur ;
            }
            header("Location: $url");
            session_start();
            $_SESSION['idPartie'] = $identifiant;
        }
        // Sinon on marque qu'il y a eu un problème
        else{
            //header('Location: ../formulaireDifficulteBot.html');
            echo "<h4>Probleme lors de l'insertion de la partie dans la base.'</h4>";
        }

        
    }



?>