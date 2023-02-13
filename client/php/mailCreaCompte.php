<?php

    $mail = $_POST['leMail'];
    $pseudonyme = $_POST['pseudo'];

    $sujet = "Création de compte Jdsel";

    $message = "Bienvenue $pseudonyme dans l'univers Jdsel !";

    mail($mail, $sujet, $message);


?>