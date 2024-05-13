const express = require("express");
//Aqui utilizei o framework express que simplifica o processo de criação de servidores web, lidando com rotas, pedidos e respostas de maneira mais fácil.

const path = require('path')

const mysql = require("mysql");
//Aqui estou importando os módulos mysql para o nodejs, o qual é um driver do banco de dados do mysql para node.js, que permite que aplicações de node se comunique com o banco de dados. 

const main = express();

const dotenv = require('dotenv');
//Mantém dados sensíveis fora do código-fonte. A professora reclamou do último sobre segurança, espero que se ela reclamar possamos mostrar e ela conhecer essa biblioteca.
// podemos acessar qualquer variável de ambiente no código usando process.env.NOME_DA_VARIAVEL. (veja o exemplo a partir da linha 15, const db)

const cookieParser = require('cookie-parser');

dotenv.config({ path: './.env'});

const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE 
});
//Aqui vou criar conexão com banco de dados


const publicDiretory = path.join(__dirname, './public')
main.use(express.static(publicDiretory))

main.use(express.urlencoded({extended: false }))
main.use(express.json());
main.use(cookieParser());

main.set('view.engine', 'hbs')

db.connect( (error) => {
    if (error) {
        console.log(error)
    } else{
        console.log ("MYSQL conectado....")
    }
})

//Aqui vou reoganizar as rotas 
main.use('/', require('./routes/pages.js'));
main.use('/auth', require('./routes/auth'));

main.listen(7000, () => {
    console.log("Servidor foi iniciado na porta 7000");
})