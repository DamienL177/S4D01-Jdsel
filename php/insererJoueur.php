<?php

    // On vérifie que toutes les variables nécessaires ont été définies
    if(isset($_POST['pseudo']) && isset($_POST['mail']) && isset($_POST['anneeNaiss']) && isset($_POST['mdp']) && isset($_POST['mdpVerif'])){
        if($_POST['pseudo'] != "" && $_POST['mail'] != "" && $_POST['anneeNaiss'] != "" && $_POST['mdp'] != "" && $_POST['mdpVerif'] != ""){
            if(($_POST['pseudo'] != "") && ($_POST['mail'] != "") && ($_POST['mdp'] != "")){
                // On vérifie que le mot de passe a correctement été saisi deux fois
                if($_POST['mdp'] == $_POST['mdpVerif']){
                    try{
                        // On définit les variables nécessaires au lien avec la BD
                        $bdd = "Jdsel";
                        $host = "localhost";
                        $user= "Grp4";
                        $pass = "u=5#5^xvcGEoKdq0>E";
    
                        // On définit les variables nécessaires à la commande
                        $nomtable = "Joueur";
                        $pseudonyme = $_POST['pseudo'];
                        $mail = $_POST['mail'];
                        $anneeNaiss = $_POST['anneeNaiss'];
                        $motDePasse = password_hash($_POST['mdp'], PASSWORD_BCRYPT);
    
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
                
                        // On compte le nombre de pseudonymes similaires
                        $requete = $link->prepare("SELECT COUNT(*) as nbId FROM $nomtable WHERE pseudonyme = ?;");
                        $requete->bind_param("s", $pseudonyme);
                        $requete->execute();
                        $result = $requete->get_result();
                        $row = mysqli_fetch_array($result);
    
                        if($row['nbId'] == 0){
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
    
                            // On créé la requête et on lance l'insertion d'un Joueur dans la base
                            $requete = $link->prepare("INSERT INTO $nomtable VALUES(?,?, ?, ?, ?, NULL);");
                            $requete->bind_param("sssss", $identifiant, $pseudonyme, $anneeNaiss, $mail, $motDePasse);
                            $requete->execute();
                    
                            if ($link->connect_errno){
                                echo "<p>Problème de query : " , $link->connect_error ,"</p>";
                                throw new Exception();
                            }
                    
                            // On ferme le lien avec la BD
                            $link->close();
                            
                            // Si l'insertion est réussie on continue
                            if($result == true){
                                header("Location: ../main.php");
                                // On lance l'envoi d'un mail
                                $_POST['leMail'] = $mail;
                                $_POST['pseudo'] = $pseudonyme;
                                require("mailCreaCompte.php");
                                session_start();
                                $_SESSION['idPlayer'] = $identifiant;
                            }
                            // Sinon on marque qu'il y a eu un problème
                            else{
                                header('Location: ../creaCompte.html?error=creation');
                            }
                        }
                        else{
                            header('Location: ../creaCompte.html?error=pseudoUtilise');
                        }
                    
                        
                    }
                    catch(Exception $e) {
                        echo "<p>Problème dans les commandes de la Base de Données</p>";
                    }
                }
                else {
                    header('Location: ../creaCompte.html?error=mdpDifferent');
                }
            }
            else {
                header('Location: ../creaCompte.html?error=champVide');
            }
        }
        else {
            header('Location: ../creaCompte.html?error=champVide');
        }
        

    }
    else {
        header('Location: ../creaCompte.html?error=champVide');
    }



?>