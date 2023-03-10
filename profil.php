<?php
    session_start();
    if(!isset($_SESSION['idPlayer'])){
        header('Location: ./index.html');
    }

?>
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="css/defaut.css" />
    <link rel="stylesheet" href="css/profil.css" />
    <title>Jdsel - Profil</title>
</head>
<body>
    <header>
        <a href="main.php"  class="nav-a" ><img src="Images/Logojdsel.png"/></a>
        <a href="main.php" class="nav-a"><button><h3>Jeux</h3></button></a>
        <a href="contact.php" class="nav-a" ><button><h3>Contact</h3></button></a>
        <a href="profil.php" class="nav-a"><button><h3>Profil</h3></button></a>
        <a href="php/deconnexion.php"><button><h3>Se déconnecter</h3></button></a>
        <h1>Jeux disponibles</h1>
    </header>
</body>
</html>