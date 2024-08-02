const express=require('express');
const app=express();
const cookieParser = require('cookie-parser');
const bcrypt=require("bcrypt")
const jwt=require("jsonwebtoken")
const path=require('path')
const db=require('./config/mongoose-connection');
const ownersRouter=require('./routes/ownersrouter')
const productsRouter=require('./routes/porductsRouter');
const usersRouter=require('./routes/userRouter');


app.set("view engine","ejs");
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser())
app.use(express.static(path.join(__dirname,"public")));

app.use("/owners",ownersRouter);
app.use("/users",usersRouter);
app.use("/products",productsRouter);
app.listen(3000)