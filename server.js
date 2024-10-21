require('dotenv').config();

const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/restful-auth-apis')

const express =require("express");
const app=express();

app.set('view engine','ejs');
app.set('views','./views');
const port = process.env.SERVER_PORT || 3000;

const userRoute =require('./routes/userRoute');
app.use('/api',userRoute);

const authRoute =require('./routes/authRoute');
app.use('/',authRoute);

app.listen(port,function(){
    console.log("Server Listen on port "+ port);
})
