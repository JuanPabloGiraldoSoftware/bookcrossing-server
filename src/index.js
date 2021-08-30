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
    host: process.env.DB_HOST || '4.tcp.ngrok.io',
    port: process.env.DB_PORT || '11663',
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
app.get('/', (req,res)=>{
    res.send("All good!")
})
app.post('/login', (req, res)=>{
    let {username, password} = req.body
    dbManager.query(`SELECT * FROM users`, (err, result)=>{
        console.log(err)
        let verifyUser = false;
        for (let i = 0; i < result.length; i++) {
            if(result[i].username===username && result[i].password===password){
                verifyUser=true;
                res.send(verifyUser)
                
            }
        } 
        if(!verifyUser){
            res.send(verifyUser)
        }
    })
});

app.post('/signup', (req, res)=>{
   const {username, password, email, cel} = req.body;
   var flag = false;
   dbManager.query(`INSERT INTO users (username, password, email, cel) VALUES (${username}, ${password}, ${email}, ${cel});`, (err, result)=>{
       flag = true;
   });
   flag? res.send(true):res.send(false);
});

app.post('/addingbooks', (req, res)=>{
    const {title, author, language, gender, year, owner, ownerId} = req.body
    var flagBook = false;
    dbManager.query(`INSERT INTO books (title, author, language, gender, year, userName, userId) VALUES (${title}, ${author}, ${language}, ${gender}, ${year}, ${owner}, ${ownerId});`, (err, result)=>{
        flagBook = true;
        res.send(flagBook);
    });
 });

 app.get('/getallBooks', (req, res)=>{ 
    dbManager.query(`SELECT * FROM books`, (err, result)=>{
        console.log(result);
        result.length<=0?res.send(false):res.send(result)
        console.log(err);
    });
 });

 app.post('/getUserId', (req, res)=>{ 
    const usrname = req.body.username.toString();
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

 app.post('/getBooksFromUser',(req,res)=>{
    const uId = req.body.userId;
    dbManager.query(`SELECT * FROM users INNER JOIN books ON users.id=books.userId WHERE userId=${uId}`, (err, result)=>{
        res.send(result);
    })
 })

 app.post('/saveSelection',(req,res)=>{
    const {userId,ownerId,bookId} = req.body
    var flagBook = false;
    dbManager.query(`INSERT INTO tradeMatching (userId, ownerId, bookId) VALUES (${userId}, ${ownerId}, ${bookId});`, (err, result)=>{
        flagBook = true;
        res.send(flagBook);
    });
 })

 app.post('/verifyMatch',(req,res)=>{
     const {traderId, ownerId} = req.body;
     console.log(traderId,ownerId)

     dbManager.query(`SELECT ownerId, userId, COUNT(*) FROM tradeMatching 
     WHERE (ownerId=${ownerId} AND userId=${traderId}) 
     OR (ownerId=${traderId} AND userId=${ownerId})
     GROUP BY userId, ownerId `, (err, result)=>{
        console.log("request",result.length);
        console.log("request",result);
        if(result.length === 2){
            dbManager.query(`SELECT * FROM tradeMatching 
            WHERE (ownerId=${ownerId} AND userId=${traderId}) 
            OR (ownerId=${traderId} AND userId=${ownerId})`, (err, result)=>{
                let iBooks = new Map();
                let keyOwnerTrader = ownerId-traderId;
                let keyTraderOwner = traderId-ownerId;
                iBooks.set(keyOwnerTrader,[]);
                iBooks.set(keyTraderOwner,[]);
                for (let i = 0; i < result.length; i++) {
                    let currentKey = result[i].userId - result[i].ownerId
                    const prev = iBooks.get(currentKey)
                    const current = [...prev,result[i].bookId]
                    console.log("current",current)
                    iBooks.set(currentKey,current);
                }
                console.log(iBooks);
                res.send([iBooks.get(keyOwnerTrader),iBooks.get(keyTraderOwner)])
            })
        }else{
            res.send(false)
        }
        
    });
     
 });

 app.post('/verifySelected',(req,res)=>{
     const {bookId, traderId} = req.body;
     dbManager.query(`SELECT * FROM tradeMatching 
     WHERE bookId=${bookId} AND userId=${traderId}`,(err,result)=>{
        console.log(result)
        result.length?res.send(false):res.send(true);
     })
 })

 app.post('/verifyLikedBook', (req, res)=>{
     const {userId,bookId} = req.body
     console.log("req body", bookId, userId);
     dbManager.query(`SELECT * FROM tradeMatching 
     WHERE bookId=${bookId} AND userId=${userId}`,(err,result)=>{
        console.log("likedBookRes",result);
        result.length?res.send(true):res.send(false);
     })
 });

 app.post('/unlikeBook', (req, res)=>{
    const {userId,bookId} = req.body
    console.log("req body", bookId, userId);
    dbManager.query(`DELETE FROM tradeMatching 
    WHERE bookId=${bookId} AND userId=${userId}`,(err,result)=>{
        console.log(result)
       !err?res.send(true):res.send(false)
    })
});

app.post('/getBooksById', (req, res)=>{ 
    const {booksOwner, booksTrader} = req.body;
    
    dbManager.query(`SELECT * FROM books`, (err, result)=>{
        let k = 0;
        let booksO = [];
        console.log(result)
        console.log(booksOwner)
        while(k < booksOwner.length){
            let find = false;
            let i = 0;
            while(i<result.length && !find){
                console.log("relquery",typeof result[i].id)
                console.log("body",typeof booksOwner[k])
                if(result[i].id===booksOwner[k]){
                    console.log("in!")
                    booksO.push(result[i])
                    find=true
                }
                i+=1
            }
            k+=1
        }

        k = 0;
        let booksT = [];
        console.log(result)
        console.log(booksTrader)
        while(k < booksTrader.length){
            let find = false;
            let i = 0;
            while(i<result.length && !find){
                console.log("relquery",typeof result[i].id)
                console.log("body",typeof booksTrader[k])
                if(result[i].id===booksTrader[k]){
                    console.log("in!")
                    booksT.push(result[i])
                    find=true
                }
                i+=1
            }
            k+=1
        }
        console.log(booksO)
        console.log(booksT)
        res.send([booksO,booksT])
    });
 });

 app.post('/getallMatches', (req, res)=>{
    const userId = req.body.userId
    console.log("incoming ID:",userId);
    dbManager.query(`SELECT *
    FROM tradeMatching 
    WHERE userId = ${userId} OR ownerId = ${userId}
    ORDER BY userId ASC`, (err, result)=>{
        console.log(result);
        !result?res.send("indefinido"):null;
        let matchedUsers = [];
        let mappedUsers = new Map();
        for (let i = 0; i < result.length; i++) {
            console.log('rowi',i);
            console.log(matchedUsers)
            const conditionalColumn = result[i].userId===userId;
            const otherUser = conditionalColumn?result[i].ownerId:result[i].userId;
            console.log('otheruser',otherUser)
            for (let j = i+1; j < result.length; j++) {
                console.log('rowj',j);
                const currentUser =  conditionalColumn?result[j].userId:result[j].ownerId
                console.log('mapa',mappedUsers)
                console.log('current',currentUser)
                console.log('conditional',conditionalColumn)
                console.log('userId',userId);
                console.log('result_j',result[j]);
                console.log('result_i',result[i]);
                if(currentUser===otherUser && conditionalColumn){
                    !matchedUsers.includes(otherUser)?matchedUsers.push(otherUser):null;
                    if(mappedUsers.has(`${otherUser}-->${userId}`)){
                        if(!mappedUsers.get(`${otherUser}-->${userId}`).includes(result[j].bookId)){
                            mappedUsers.set(`${otherUser}-->${userId}`,
                            [...mappedUsers.get(`${otherUser}-->${userId}`),result[j].bookId])
                        }
                    }else{
                        mappedUsers.set(`${otherUser}-->${userId}`,[result[j].bookId])
                    }

                    if(mappedUsers.has(`${userId}-->${otherUser}`)){
                        if(!mappedUsers.get(`${userId}-->${otherUser}`).includes(result[i].bookId)){
                            mappedUsers.set(`${userId}-->${otherUser}`,
                            [...mappedUsers.get(`${userId}-->${otherUser}`),result[i].bookId])
                        }
                    }else{
                        mappedUsers.set(`${userId}-->${otherUser}`,[result[i].bookId])
                    }

                }else if(currentUser===otherUser && !conditionalColumn){
                    !matchedUsers.includes(otherUser)?matchedUsers.push(otherUser):null;
                    if(mappedUsers.has(`${otherUser}-->${userId}`)){
                        if(!mappedUsers.get(`${otherUser}-->${userId}`).includes(result[i].bookId)){
                            mappedUsers.set(`${otherUser}-->${userId}`,
                            [...mappedUsers.get(`${otherUser}-->${userId}`),result[i].bookId])
                        }
                    }else{
                        mappedUsers.set(`${otherUser}-->${userId}`,[result[i].bookId])
                    }

                    if(mappedUsers.has(`${userId}-->${otherUser}`)){
                        if(!mappedUsers.get(`${userId}-->${otherUser}`).includes(result[j].bookId)){
                            mappedUsers.set(`${userId}-->${otherUser}`,
                            [...mappedUsers.get(`${userId}-->${otherUser}`),result[j].bookId])
                        }
                    }else{
                        mappedUsers.set(`${userId}-->${otherUser}`,[result[j].bookId])
                    }
                }
                
            }
        }
        dbManager.query(`SELECT * FROM books`, (err, result)=>{
            for(let [key, value] of mappedUsers){
                let fullBooks = []
                for (let i = 0; i < result.length; i++) {
                    if(value.includes(result[i].id)){
                        console.log("in add")
                        fullBooks.push(result[i])
                    }
                }
                mappedUsers.set(key,fullBooks)
            }
            console.log(matchedUsers)
            console.log(Object.fromEntries(mappedUsers))
            matchedUsers.length?res.send([Object.fromEntries(mappedUsers),matchedUsers]):res.send(false)
            console.log(err);
        })

    });
 });


 app.post('/getUserById', (req, res)=>{ 
    const userId = req.body.userId;
    dbManager.query(`SELECT * FROM users WHERE id=${userId}`, (err, result)=>{
        console.log(result)
        result?res.send(result):false;
    })
 })


 app.post('/deleteBook', (req, res)=>{ 
    const bookId = req.body.bookId;
    dbManager.query(`DELETE FROM tradeMatching WHERE bookId=${bookId}`, (err, result)=>{
        console.log(result)
        console.log(err)
        dbManager.query(`DELETE FROM books WHERE id=${bookId}`, (err, result)=>{
            console.log(result)
            console.log(err)
            res.send(true)
        })
    })
 })

