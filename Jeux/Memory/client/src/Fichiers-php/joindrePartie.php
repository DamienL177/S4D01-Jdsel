<?php
    
    header("Location: http://153.92.211.90:8080");
    session_start();
    $identifiant = $_SESSION['idPartie'];

    print "<script src='/socket.io/socket.io.js'></script>";
    print "<script src='./client.js' id='$identifiant'></script>";



?>