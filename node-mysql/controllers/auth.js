const mysql = require("mysql");
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')

const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE 
});

exports.login = async (req, res) => {
    try {
        const {email, password} = req.body;

        if( !email || !password ) {
            return res.status(400).render('login.hbs', {
                message: 'Por favor Forneça uma senha ou e-mail'
            })  
        }

        db.query('SELECT * FROM users WHERE email = ?', [email], async (error, results) =>{ 
            console.log(results);
            if( !results || !(await bcrypt.compare(password, results[0].password))){  //modifcações perigosas
                res.status(401).render('login.hbs', {
                    message: 'E-mail ou senha estão incorretos'
                });
            } else {
                const id = results[0].id;

                const token = jwt.sign({id: id }, process.env.JWT_SECRET, {
                    expiresIn: process.env.JWT_EXPIRES_IN
                });

                console.log("the token is: " + token);

                const cookieOptions = {
                    expires: new Date(
                        Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000
                    ),
                    httpOnly: true 
                }

                res.cookie('jwt', token, cookieOptions);
                res.status(200).redirect("/");
            } 

        })
        
    } catch (error) {
        console.log(error);
    }
}

exports.register = (req, res) => {
    console.log(req.body);

    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;

    //aqui vou importar meu database

    db.query('SELECT email FROM users WHERE email = ?', [email], async (error, results) =>{
        if(error) {
            console.log(error);
        }

        if( results.length > 0 ) {
            return res.render('register.hbs', {
                message: 'Esse e-mail já está sendo utilizado'
            })
        }else if(password !== confirmPassword){
            return res.render('register.hbs', {
                message: 'As senhas não coincidem'
            });
        }

        let hashedPassword = await bcrypt.hash(password, 8);
        console.log()

        db.query('INSERT INTO users SET ?', {name: name, email: email, password:hashedPassword}, (error, results) =>{
            if(error){
                console.log(error);
            }else {
                console.log(results)
                return res.render('register.hbs', {
                    message: 'Usuário registrado'
                })
            }
        })

    });

}