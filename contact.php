<?php
    /*
    session_start();
    if(!isset($_SESSION['idPlayer'])){
        header('Location: ./index.html');
    }
*/
?>
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="css/defaut.css" />
    <link rel="stylesheet" href="css/contact.css" />
    <title>Jdsel - Contact</title>
</head>
<body>
    <header>
        <nav>
            <ul class="menu">
                <a href="main.php"   ><img src="Images/Logojdsel.png" class="image"/></a>  
                <li>
                    <a href="main.php" class="bouton">Jeux</a>    
                </li>
                <li>
                    <a href="contact.php" class="actif bouton">Contact</a>
                </li>
                <li>
                    <a href="profil.php" class="bouton">Profil</a>
                </li>
                <li>
                    <a href="php/deconnexion.php" class="bouton">Se déconnecter</a>
                </li>
            </ul>
        </nav>
    </header>
</body>
</html>