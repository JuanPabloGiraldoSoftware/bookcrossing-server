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
    host: process.env.DB_HOST || '6.tcp.ngrok.io',
    port: process.env.DB_PORT || '12484',
    database: process.env.DB_NAME || 'db_bookcrossing',
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

app.post('/signup', (req, res)=>{
   const {username, password, email, cel} = req.body;
   var flag = false;
   dbManager.query(`INSERT INTO users (username, password, email, cel) VALUES (${username}, ${password}, ${email}, ${cel});`, (err, result)=>{
       console.log(result);
       console.log(err);
       flag = true;
   });
   flag? res.send(true):res.send(false);
});

app.post('/addingbooks', (req, res)=>{
    const {title, author, language, gender, year, owner, ownerId} = req.body
    var flagBook = false;
    dbManager.query(`INSERT INTO books (title, author, language, gender, year, userName, userId) VALUES (${title}, ${author}, ${language}, ${gender}, ${year}, ${owner}, ${ownerId});`, (err, result)=>{
        console.log(result);
        console.log(err);
        flagBook = true;
        console.log(flagBook);
        res.send(flagBook);
    });
    console.log("adadafdsdf",flagBook);
 });

 app.get('/getallBooks', (req, res)=>{ 
    dbManager.query(`SELECT * FROM books`, (err, result)=>{
        res.send(result)
    });
 });

 app.post('/getUserId', (req, res)=>{ 
    const usrname = req.body.username.toString();
    console.log("waht",usrname);
    dbManager.query(`SELECT * FROM users`, (err, result)=>{
        let userId="";
        let i = 0;
        let find = false;
        while(i<result.length && !find){
            if(result[i].username===usrname){
                userId=result[i];
                find=true;
            }
            i+=1
        }
        res.send(userId)
    });
 });