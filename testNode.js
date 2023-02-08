const http = require('../node/http');

const server = http.createServer((req, res) => {
    res.end('Voilà la réponse du serveur !');
})

server.close();