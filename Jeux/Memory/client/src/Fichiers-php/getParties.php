<?php
    header('Content-Type: text/xml');

    // On définit les variables nécessaires au lien avec la BD
    $bdd = "Jdsel";
    $host = "localhost";
    $user= "Grp4";
    $pass = "u=5#5^xvcGEoKdq0>E";
    $nomtable = "Partie";

    // On fait le lien avec la BD
    $link = new mysqli($host,$user,$pass,$bdd);

    if ($link->connect_errno){
        echo "<p>Problème de connect : " , $link->connect_error ,"</p>";
        throw new Exception();
    }

    //on lance la requete
    $requete = $link->prepare("SELECT identifiant FROM ? WHERE estCommencee IS FALSE AND estFini IS FALSE");
    $requete->bind_param("s", $nomtable);
    $requete->execute();
    $result = $requete->get_result();

    $link->close();
    


    //On boucle sur le resultat
    echo "<?xml version=\"1.0\"?>\n";
    echo "<exemple>\n";
    while ($row = mysqli_fetch_array($result))
    {
        echo "<donnee>$row[0]</donnee>\n";
    }
    echo "</exemple>\n";
?>