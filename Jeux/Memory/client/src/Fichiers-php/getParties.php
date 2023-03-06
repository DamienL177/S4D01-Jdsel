<?php
    header('Content-Type: text/xml');

    // On définit les variables nécessaires au lien avec la BD
    $bdd = "Jdsel";
    $host = "localhost";
    $user= "Grp4";
    $pass = "u=5#5^xvcGEoKdq0>E";
    $nomtable = "Partie";

    // On fait le lien avec la BD
    $link = mysqli_connect($host,$user,$pass,$bdd);

    if (mysqli_connect_errno()){
        echo "<p>Problème de connect : " , mysqli_connect_error() ,"</p>";
        throw new Exception();
    }

    //on lance la requete
    $query = "SELECT identifiant FROM $nomtable WHERE estCommencee IS FALSE AND estFini IS FALSE";
    $result = mysqli_query($link,$query);

    mysqli_close($link);
    


    //On boucle sur le resultat
    echo "<?xml version=\"1.0\"?>\n";
    echo "<exemple>\n";
    while ($row = mysqli_fetch_array($result))
    {
        echo "<donnee> $row[0] </donnee>\n";
    }
    echo "</exemple>\n";
?>