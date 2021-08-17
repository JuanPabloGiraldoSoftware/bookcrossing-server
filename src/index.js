const express = require('express');
const morgan = require('morgan');

//Initialization
const app = express();
app.set('port', process.env.PORT || 4000);
app.use(morgan('dev'));
app.listen(app.get('port'), () =>{
    console.log(`Server running on http://localhost:${app.get('port')}`)
})

//Routes
app.get('/login', (req, res)=>{
    res.send("Hlo World")
});