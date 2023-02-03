<?php

    // On vérifie que toutes les variables nécessaires ont été définies
    if(isset($_POST['pseudo']) && isset($_POST['mail']) && isset($_POST['anneeNaiss']) && isset($_POST['mdp']) && isset($_POST['mdpVerif'])){

        // On vérifie que le mot de passe a correctement été saisi deux fois
        if($_POST['mdp'] == $_POST['mdpVerif']){
            try{
                // On définit les variables nécessaires au lien avec la BD
                $bdd = "u562708442_Jdsel";
                $host = "localhost";
                $user= "u562708442_Grp4";
                $pass = "u=5#5^xvcGEoKdq0>E";

                // On définit les variables nécessaires à la commande
                $nomtable = "Joueur";
                $pseudonyme = $_POST['pseudo'];
                $mail = $_POST['mail'];
                $anneeNaiss = $_POST['anneeNaiss'];
                $motDePasse = $_POST['mdp'];

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
        
                // On définit l'identifiant
                // Tant que nous n'avons pas un identifiant OK
                while(!$idOK){
                    // On définit l'identifiant
                    $identifiant = '';
                    // On le remplit avec 16 caractères aléatoires parmi les caractères possibles
                    for($i = 0; $i < 16; $i++){
                        $index = array_rand($tabCharsId);
                        $identifiant .= $tabCharsId[$index];
                    }
                    // On compte le nombre d'identifiants similaires
                    $query = "SELECT COUNT(*) FROM $nomtable WHERE identifiant = '$identifiant'";
                    $result= mysqli_query($link, $query);

                    // S'il n'y en a pas on sort de la boucle
                    if($result == 0){
                        $idOK = true;
                    }
                }

                // On créé la requête et on lance l'insertion d'un Joueur dans la base
                $query = "INSERT INTO $nomtable VALUES('$identifiant', '$pseudonyme', $anneeNaiss, '$mail', '$motDePasse', NULL)";
                $result = mysqli_query($link, $query);
        
                if (mysqli_connect_errno()){
                    echo "<p>Problème de query : " , mysqli_connect_error() ,"</p>";
                    throw new Exception();
                }
        
                // On ferme le lien avec la BD
                mysqli_close($link);
                
                // Si l'insertion est réussie on continue
                if($result == true){
                    header("Location: ../main.html");
                }
                // Sinon on marque qu'il y a eu un problème
                else{
                    header('Location: ../creaCompte.html');
                    echo("<h4>Probleme lors de la creation de compte.</h4>");
                }
                
                
            }
            catch(Exception $e) {
                echo "<p>Problème dans les commandes de la Base de Données</p>";
            }
        }
        else {
            header('Location: ../creaCompte.html');
            echo("<h4>Vous n'avez pas saisi deux fois le même mot de passe</h4>");
        }
    }
    else {
        header('Location: ../creaCompte.html');
        echo("<h4>Merci de remplir tous les champs</h4>");
    }



?>