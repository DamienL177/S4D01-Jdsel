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
    <title>Jdsel - Accueil</title>
</head>
<body>
    <header>
    <a href="main.php"><img id="logo" src="Images/Logojdsel.png" class="image"/></a>
    <ul class="menu">       
        <li><a href="main.php" class="actif"><button>Jeux</button></a></li>
        <li><a href="Communication/client/communication.php"><button>Contact</button></a></li>
        <li><a href="profil.php"><button>Profil</button></a></li>
        <li><a href="php/deconnexion.php"><button>Se déconnecter</button></a></li>
    </ul>
    </header>
    <main>
        <h1>Jeux disponibles</h1>
        <section id="grille-jeux">
            <?php
                // On définit les variables nécessaires au lien avec la BD
                $bdd = "Jdsel";
                $host = "localhost";
                $user= "Grp4";
                $pass = "u=5#5^xvcGEoKdq0>E";
                $table = "Jeu";

                $link = mysqli_connect($host, $user, $pass, $bdd);
                if (mysqli_connect_errno()){
                    echo "<p>Problème de connect : " , mysqli_connect_error() ,"</p>";
                    die("La connexion a échouée");
                }
                
                $requete = mysqli_query($link, "SELECT nom, lienMiniature, lienJeu FROM $table");
                while ($donnees=mysqli_fetch_assoc($requete)) {
                    $nom = $donnees["nom"];
                    $minia = $donnees["lienMiniature"];
                    $jeu = $donnees["lienJeu"];
                    print "<article>";
                    print " <h3>$nom</h3>";
                    print " <a href='$jeu'><img src ='$minia'/></a>";
                    print "</article>";
                }
                mysqli_close($link);
            ?>
        </section>
    </main>
    <footer>
    </footer>
</body>
</html>