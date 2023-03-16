<?php
    session_start();

    if(isset($_SESSION['idPlayer'])){
        // On définit les variables nécessaires au lien avec la BD
        $bdd = "Jdsel";
        $host = "localhost";
        $user= "Grp4";
        $pass = "u=5#5^xvcGEoKdq0>E";
        $nomtable = "Joueur";
        
        $idJoueur = $_SESSION['idPlayer'];

        // On fait le lien avec la BD
        $link = new mysqli($host,$user,$pass,$bdd);

        if ($link->connect_errno){
            echo "<p>Problème de connect : " , $link->connect_error ,"</p>";
            throw new Exception();
        }

        //on lance la requete
        $requete = $link->prepare("SELECT pseudonyme FROM $nomtable WHERE identifiant = ?;");
        $requete->bind_param("s", $identifiant);
        $requete->execute();
        $result = $requete->get_result();

        $link->close();

        $pseudoJoueur= mysqli_fetch_array($result)[0];


        $url = "http://153.92.211.90:8888/?pseudojoueur=" . $pseudoJoueur;
        header("Location: $url");
    }
    else{
        header('Location: ../../index.html');
    }



?>