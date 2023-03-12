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
        $link = mysqli_connect($host,$user,$pass,$bdd);

        if (mysqli_connect_errno()){
            echo "<p>Problème de connect : " , mysqli_connect_error() ,"</p>";
            throw new Exception();
        }

        //on lance la requete
        $query = "SELECT pseudonyme FROM $nomtable WHERE identifiant = '$idJoueur'";
        $result = mysqli_query($link,$query);

        mysqli_close($link);

        $pseudoJoueur= mysqli_fetch_array($result)[0];


        $url = "http://153.92.211.90:8888/?pseudojoueur=" . $pseudoJoueur;
        header("Location: $url");
    }
    else{
        header('Location: ../../index.html');
    }



?>