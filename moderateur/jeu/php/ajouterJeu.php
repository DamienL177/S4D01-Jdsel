<?php

    function Delete($path)
    {
        if (is_dir($path) === true)
        {
            $files = array_diff(scandir($path), array('.', '..'));

            foreach ($files as $file)
            {
                Delete(realpath($path) . '/' . $file);
            }

            return rmdir($path);
        }

        else if (is_file($path) === true)
        {
            return unlink($path);
        }

        return false;
    }

    function copierDoc($strDir, $chemin){
        $count = 0;


        $JSONDir = json_decode($strDir, true);
        $fichierCible = $chemin;

        if(isset($JSONDir['fichiers'])){
            foreach($JSONDir['fichiers'] as $nomFichier){
                $trouve = false;
                foreach($_FILES['fichiers']['name'] as $i => $name) {
                    if ($name == $nomFichier) {
                        if (move_uploaded_file($_FILES['fichiers']['tmp_name'][$i], $fichierCible.$name)) {
                            $count++;
                            $trouve = true;
                        }
                        else {
                            echo "Sorry, there was an error uploading your file.";
                        }
                    }
                }
                if($trouve == false){
                    return -1;
                }
            }
        }

        if(isset($JSONDir['dossiers'])){
            foreach($JSONDir["dossiers"] as $sousDossier){
                $cheminDossier = $chemin.$sousDossier['name']."/";
                if(file_exists($cheminDossier)){
                    Delete($cheminDossier);
                }
        
                mkdir($cheminDossier, 0755, true);
    
                $retour = copierDoc(json_encode($sousDossier), $cheminDossier);
                if($retour == -1){
                    return -1;
                }
                else{
                    $count += $retour;
                }
            }
        }
        

        return $count;
    }

    header('Location: ../ajouterUnJeu.html');

    error_reporting(E_ALL);
    ini_set("display_errors", 1);

    //echo $_POST['titre'];
    //echo $_POST['description'];

    if(isset($_POST['titre']) && isset($_FILES['fichiers']) && isset($_POST['description']) && isset($_FILES['JSONArbre'])){
        session_start();
        $titre = $_POST['titre'];
        $description = $_POST['description'];
        $idModo = $_SESSION['idMod'];

        $titreBien = str_replace(" ", "_", $titre);

        
        $chemin = "../../../Jeux/" . $titreBien . "/";

        if(file_exists($chemin)){
            Delete($chemin);
        }

        mkdir($chemin, 0755, true);

        if(isset($_FILES["image"])){
            $lienMiniature = $chemin . basename($_FILES["image"]["name"]);
            $uploadOk = 1;
            $imageFileType = strtolower(pathinfo($lienMiniature,PATHINFO_EXTENSION));

            // Check if image file is a actual image or fake image
            $check = getimagesize($_FILES["image"]["tmp_name"]);
            if($check !== false) {
                //echo "File is an image - " . $check["mime"] . ".";
                $uploadOk = 1;
            } else {
                echo "File is not an image.";
                $uploadOk = 0;
            }

            // Check file size
            if ($_FILES["image"]["size"] > 500000) {
                echo "Sorry, your file is too large.";
                $uploadOk = 0;
            } 

            // Allow certain file formats
            if($imageFileType != "jpg" && $imageFileType != "png" && $imageFileType != "jpeg" && $imageFileType != "gif" ) {
                echo "Sorry, only JPG, JPEG, PNG & GIF files are allowed.";
                $uploadOk = 0;
            } 

            // Check if $uploadOk is set to 0 by an error
            if ($uploadOk == 0) {
                echo "Sorry, your file was not uploaded.";
            // if everything is ok, try to upload file
            } 
            else {
                if (move_uploaded_file($_FILES["image"]["tmp_name"], $lienMiniature)) {
                    echo "The file ". htmlspecialchars( basename( $_FILES["image"]["name"])). " has been uploaded.\n";
                    $lienMiniature = $titreBien . "/" . $_FILES["image"]["name"];
                } 
                else {
                    echo "Sorry, there was an error uploading your file.";
                }
            }
        }
        else{
            $lienMiniature = null;
        }

        $lienArbre = $chemin . basename($_FILES["JSONArbre"]["name"]);

        if (move_uploaded_file($_FILES["JSONArbre"]["tmp_name"], $lienArbre)) {
            echo "The file ". htmlspecialchars( basename( $_FILES["JSONArbre"]["name"])). " has been uploaded.\n";
        } 
        else {
            echo "Sorry, there was an error uploading your file.";
        }

        $fichierJSON = file_get_contents($lienArbre);

        //$objetJSON = json_decode($fichierJSON);

    
        $count = copierDoc($fichierJSON, $chemin);

        if($count != -1){
            echo "$count files have been uploaded.\n";
        }
        else{
            echo "A problem appeared during upload\n";
        }

        $lienJeu = $titreBien. "/src/main.html";

        // ON PLACE TOUT DANS LA BD

        // On définit les variables nécessaires au lien avec la BD
        $bdd = "u562708442_Jdsel";
        $host = "localhost";
        $user= "u562708442_Grp4";
        $pass = "u=5#5^xvcGEoKdq0>E";

        // On définit les variables nécessaires à la commande
        $nomtable = "Jeu";

        // On définit les variables nécessaires au calcul de l'identifiant
        $charsId = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';    // Les caractères pouvant être utilisés
        $tabCharsId = str_split($charsId);      // Un tableau des caractères pouvant être utilisés
        $idOK = false;      // La variable nous permettant de rester dans la boucle while

        // On fait le lien avec la BD
        $link = mysqli_connect($host,$user,$pass,$bdd);

        if (mysqli_connect_errno()){
            echo "<p>Problème de connect : " , mysqli_connect_error() ,"</p>";
        }

        // On définit la requête
        $identifiant = '';
        $query = "SELECT COUNT(*) as nbId FROM $nomtable WHERE identifiant = '$identifiant'";
        // Tant que nous n'avons pas un identifiant OK on continue à en créer
        while(!$idOK){
            // On définit l'identifiant
            $identifiant = '';
            // On le remplit avec 16 caractères aléatoires parmi les caractères possibles
            for($i = 0; $i < 3; $i++){
                $index = array_rand($tabCharsId);
                $identifiant .= $tabCharsId[$index];
            }
            // On compte le nombre d'identifiants similaires
            $result = mysqli_query($link, $query);
            $row = mysqli_fetch_array($result);

            // S'il n'y en a pas on sort de la boucle
            if($row['nbId'] == 0){
                $idOK = true;
            }
        }

        $titre = str_replace("'", "''", $titre);
        $description = str_replace("'", "''", $description);

        //echo "\nINSERT INTO $nomtable VALUES ('$identifiant', '$titre', '$lienMiniature', '$lienJeu', '$description', '$idModo')";

        // On créé et on exécute la commande
        $query = "INSERT INTO $nomtable VALUES ('$identifiant', '$titre', '$lienMiniature', '$lienJeu', '$description', '$idModo')";
        $result= mysqli_query($link, $query);

        if (mysqli_connect_errno()){
            echo "<p>Problème de query : " , mysqli_connect_error() ,"</p>";
        }

        if(!$result){
            echo "<p>Problème dans l'insertion : ", mysqli_connect_errno(), " </p>";
        }
        else {
            echo "<p>The database has been updated</p>";
        }

        // On ferme le lien avec la BD
        mysqli_close($link);

    }
    else{
        echo "Tout n'a pas été rempli.";
    }
    




?>