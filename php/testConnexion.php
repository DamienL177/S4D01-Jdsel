<?php
    if(isset($_POST['pseudo']) && isset($_POST['mdp'])){
        try{
            $bdd = "u562708442_Jdsel";
            $host = "localhost";
            $user= "u562708442_Grp4";
            $pass = "u=5#5^xvcGEoKdq0>E";
            $nomtable = "Joueur";
            $pseudonyme = $_POST['pseudo'];
            $motDePasse = $_POST['mdp'];
    
            $link = mysqli_connect($host,$user,$pass,$bdd);
    
            if (mysqli_connect_errno()){
                echo "<p>Problème de connect : " , mysqli_connect_error() ,"</p>";
                throw new Exception();
            }
    
            $query = "SELECT COUNT(*) FROM $nomtable WHERE pseudonyme = $pseudonyme AND mdp = $motDePasse";
            $result= mysqli_query($link, $query);
    
            if (mysqli_connect_errno()){
                echo "<p>Problème de query : " , mysqli_connect_error() ,"</p>";
                throw new Exception();
            }
    
            mysqli_close($link);
            
            if($result == 1){
                header("Location: ../main.html");
            }
            else{
                header('Location: ../index.html');
                echo("<h4>Le pseudonyme/mot de passe ne correspond pas</h4>");
            }
            
            
        }
        catch(Exception $e) {
            echo "<p>Problème dans les commandes de la Base de Données</p>";
        }
    }
    else {
        header('Location: ../index.html');
        echo("<h4>Merci de remplir tous les champs</h4>");
    }



?>