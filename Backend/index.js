const connectDB = require('./db/connect');
const cors = require("cors");
const express = require('express')

connectDB();
const app = express()
const port = 5000

//middleware
app.use(express.json());
app.use(cors());

//app.get('/',(req,res) => {
//    res.send("Hello World!")
//})

//Routes
app.use('/user',require('./routes/user_login'))
app.use('/complaint',require('./routes/complaint'))

app.listen(port,() => {
    console.log('App listening at http://localhost:5000',port)
})