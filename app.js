const express=require('express');
const app=express();
const cookieParser = require('cookie-parser');
const bcrypt=require("bcrypt")
const jwt=require("jsonwebtoken")
const path=require('path')
const db=require('./config/mongoose-connection');
const expressSession =require('express-session');
const flash=require('connect-flash')


const ownersRouter=require('./routes/ownersrouter')
const productsRouter=require('./routes/productsRouter');
const usersRouter=require('./routes/usersRouter');
const indexRouter=require('./routes/indexRouter')


require("dotenv").config();
app.set("view engine","ejs");
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use(cookieParser())

app.use(
    expressSession({
        resave:false,
        saveUninitialized:false,
        secret:process.env.EXPRESS_SESSION_SECRET,
        
    })
)
app.use(flash());

app.use(express.static(path.join(__dirname,"public")));
app.set('views', path.join(__dirname, 'views'));



app.use("/owners",ownersRouter);
app.use("/users",usersRouter);
app.use("/products",productsRouter);
app.use("/",indexRouter);
app.listen(3000)