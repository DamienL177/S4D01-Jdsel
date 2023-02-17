<?php
    
    header("Refresh:0.1; Location: http://153.92.211.90:8080");
    session_start();
    $identifiant = $_SESSION['idPartie'];

    echo "<script src='/socket.io/socket.io.js'></script>";
    echo "<script src='./client.js' id='$identifiant'></script>";



?>