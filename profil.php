<?php
    /*session_start();
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
    <link rel="stylesheet" href="css/main.css" />
    <title>Jdsel - Profil</title>
</head>
<body>
    <header>
    <a href="main.php"><img id="logo" src="Images/Logojdsel.png" class="image"/></a>
    <ul class="menu">       
        <li><a href="main.php"><button>Jeux</button></a></li>
        <li><a href="Communication/client/communication.php"><button>Contact</button></a></li>
        <li><a href="profil.php"  class="actif"><button>Profil</button></a></li>
        <li><a href="php/deconnexion.php"><button>Se déconnecter</button></a></li>
    </ul>
    </header>
</body>
</html>