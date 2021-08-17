const express = require('express');
const morgan = require('morgan');
const bodyParser = require("body-parser")

//Initialization
const app = express();
app.set('port', process.env.PORT || 4000);
app.use(morgan('dev'));
app.use(express.json());
app.listen(app.get('port'), () =>{
    console.log(`Server running on http://localhost:${app.get('port')}`)
})

//Routes
app.post('/login', (req, res)=>{
    console.log(req.body)
    res.send("Done")
});