const express = require('express');
const morgan = require('morgan');
const mysql = require('mysql');
const cors = require('cors');

//Initialization
const app = express();
app.set('port', process.env.PORT || 4000);
app.use(morgan('dev'));
app.use(express.json());
app.use(cors());
app.listen(app.get('port'), () =>{
    console.log(`Server running on http://localhost:${app.get('port')}`)
})

//Data Base Connection
var dbManager = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'localdb',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD ||'root'
});

dbManager.connect(function(error){
    if(error){
        console.log(error);
    }else{
        console.log("Conection Succed!")
    }
});

//API Endpoints
app.post('/login', (req, res)=>{
    let {username, password} = req.body
    dbManager.query(`SELECT * FROM users`, (err, result)=>{
        console.log(err)
        let verifyUser = false;
        for (let i = 0; i < result.length; i++) {
            if(result[i].username===username && result[i].password===password){
                console.log("Login Succed!");
                verifyUser=true;
                res.send(verifyUser)
                
            }
        } 
        if(!verifyUser){
            console.log("Unexistent User!");
            res.send(verifyUser)
        }
    })
});