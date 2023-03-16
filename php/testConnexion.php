<?php
    // On vérifie si toutes les variables demandées ont été saisies
    if(isset($_POST['pseudo']) && isset($_POST['mdp'])){
        if($_POST['pseudo'] != "" && $_POST['mdp'] != ""){
            try{
                // On définit les variables nécessaires au lien avec la BD
                $bdd = "Jdsel";
                $host = "localhost";
                $user= "Grp4";
                $pass = "u=5#5^xvcGEoKdq0>E";
    
                // On définit les variables nécessaires à la commande
                $nomtable = "Joueur";
                $pseudonyme = $_POST['pseudo'];
                $motDePasse = $_POST['mdp'];
        
                // On fait le lien avec la BD
                $link = new mysqli($host,$user,$pass,$bdd);
        
                if ($link->connect_errno){
                    echo "<p>Problème de connect : " , mysqli_connect_error() ,"</p>";
                    throw new Exception();
                }
        
                // On créé et on exécute la commande
                $requete = $link->prepare("SELECT mdp FROM $nomtable WHERE pseudonyme = ?;");
                $requete->bind_param("s", $pseudonyme);
                $requete->execute();
                $result = $requete->get_result();
                /*
                $query = "SELECT mdp FROM $nomtable WHERE pseudonyme = '$pseudonyme'";
                $result= mysqli_query($link, $query);
                */
                $row = mysqli_fetch_array($result);
        
                if (mysqli_connect_errno()){
                    echo "<p>Problème de query : " , mysqli_connect_error() ,"</p>";
                    throw new Exception();
                }
                
                // Si on obtient le résultat souhaité
                if(password_verify($motDePasse, $row['mdp'])){
    
                    $query = "SELECT identifiant AS Id FROM $nomtable WHERE pseudonyme = '$pseudonyme'";
                    $result= mysqli_query($link, $query);
                    $row = mysqli_fetch_array($result);
    
                    if (mysqli_connect_errno()){
                        echo "<p>Problème de query : " , mysqli_connect_error() ,"</p>";
                        throw new Exception();
                    }
    
                    $id = $row['Id'];
    
                    session_start();
                    $_SESSION['idPlayer'] = $id;
    
                    // On continue dans le site
                    header("Location: ../main.php");
                }
                // Sinon
                else{
                    // On retourne au formulaire
                    header('Location: ../index.html?error=correspond');
                }
                
                
            }
            catch(Exception $e) {
                echo "<p>Problème dans les commandes de la Base de Données</p>";
            }
        }
        else {
            header('Location: ../index.html?error=champVide');
        }
    }
    // Sinon on le signale
    else {
        header('Location: ../index.html?error=champVide');
    }



?>