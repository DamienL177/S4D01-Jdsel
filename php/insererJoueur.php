<?php
    ini_set('display_errors', 1);
    ini_set('display_startup_errors', 1);
    error_reporting(E_ALL);

    if(isset($_POST['pseudo']) && isset($_POST['mail']) && isset($_POST['anneeNaiss']) && isset($_POST['mdp']) && isset($_POST['mdpVerif'])){
        if($_POST['mdp'] == $_POST['mdpVerif']){
            try{
                $bdd = "u562708442_Jdsel";
                $host = "localhost";
                $user= "u562708442_Grp4";
                $pass = "u=5#5^xvcGEoKdq0>E";
                $nomtable = "Joueur";
                $pseudonyme = $_POST['pseudo'];
                $mail = $_POST['mail'];
                $anneeNaiss = $_POST['anneeNaiss'];
                $motDePasse = $_POST['mdp'];

                $charsId = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
                $tabCharsId = str_split($charsId);
                $idOK = false;
        
                $link = mysqli_connect($host,$user,$pass,$bdd);
        
                if (mysqli_connect_errno()){
                    echo "<p>Problème de connect : " , mysqli_connect_error() ,"</p>";
                    throw new Exception();
                }
        
                while(!$idOK){
                    $identifiant = '';
                    for($i = 0; $i < 16; $i++){
                        $index = array_rand($tabCharsId);
                        $identifiant .= $tabCharsId[$index];
                    }
                    $query = "SELECT COUNT(*) FROM $nomtable WHERE identifiant = $identifiant";
                    $result= mysqli_query($link, $query);

                    if($result == 0){
                        $idOK = true;
                    }
                }

                $query = "INSERT INTO $nomtable VALUES('$identifiant', '$pseudonyme', $anneeNaiss, '$mail', '$motDePasse', NULL)";
                $result = mysqli_query($link, $query);
        
                if (mysqli_connect_errno()){
                    echo "<p>Problème de query : " , mysqli_connect_error() ,"</p>";
                    throw new Exception();
                }
        
                mysqli_close($link);
                
                if($result == true){
                    header("Location: ../main.html");
                }
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