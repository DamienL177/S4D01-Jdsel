<?php
    session_start();
    ini_set('display_errors', 1);
    ini_set('display_startup_errors', 1);
    error_reporting(E_ALL);

    // Si on connait le niveau de la machine
    if(isset($_POST['lvlMachine'])){
        // On récupère le niveau de la machine
        $niveauMachine = $_POST['lvlMachine'];

        // On renvoit vers la page main.html
        header("Refresh:0.2; url=../indexLocal.html");

        // On place le niveau de la machine dans une variable locale javascript
        print "<script type='text/javascript'>localStorage.setItem('nivMachine', '$niveauMachine')</script>";
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
        //$estCommencee = FALSE;
        //$estFinie = FALSE;

        // On définit les variables nécessaires au calcul de l'identifiant
        $charsId = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';    // Les caractères pouvant être utilisés
        $tabCharsId = str_split($charsId);      // Un tableau des caractères pouvant être utilisés
        $idOK = false;      // La variable nous permettant de rester dans la boucle while

        // On fait le lien avec la BD
        $link = new mysqli($host,$user,$pass,$bdd);

        if ($link->connect_errno){
            echo "<p>Problème de connect : " , $link->connect_error ,"</p>";
            throw new Exception();
        }

        if(isset($_SESSION['idPlayer'])){
            $idJoueur = $_SESSION['idPlayer'];
            $tableJoueur = "Joueur";
            $requete = $link->prepare("SELECT pseudonyme FROM $tableJoueur WHERE identifiant = ?;");
            $requete->bind_param("s", $idJoueur);
            $requete->execute();
            $result = $requete->get_result();
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
            $requete = $link->prepare("SELECT COUNT(*) as nbId FROM $nomtable WHERE identifiant = ?;");
            $requete->bind_param("s", $identifiant);
            $requete->execute();
            $result = $requete->get_result();
            $row = mysqli_fetch_array($result);

            // S'il n'y en a pas on sort de la boucle
            if($row['nbId'] == 0){
                $idOK = true;
            }
        }
        //echo "INSERT INTO $nomtable VALUES('$identifiant', '$laDate', FALSE, FALSE, 'A01', NULL)\n";
        // On créé la requête et on lance l'insertion d'un Joueur dans la base
        $requete = $link->prepare("INSERT INTO $nomtable VALUES(?,?, FALSE, FALSE, 'A01', NULL);");
        $requete->bind_param("ss", $identifiant, $laDate);
        $requete->execute();
        $result = $requete->get_result();

        if ($link->connect_errno){
            echo "<p>Problème de query : " , $link->connect_error ,"</p>";
            throw new Exception();
        }

        // On ferme le lien avec la BD
        $link->close();

        // Si l'insertion est réussie on continue
        if($result == true){
            $url = "http://153.92.211.90:8080/?idpartie=" . $identifiant;
            if(isset($pseudoJoueur)){
                $url = $url . "&pseudojoueur=" . $pseudoJoueur ;
            }
            header("Location: $url");
            
            $_SESSION['idPartie'] = $identifiant;
        }
        // Sinon on marque qu'il y a eu un problème
        else{
            header('Location: ../optionsPartie.html?error=insertion');
        }

        
    }



?>