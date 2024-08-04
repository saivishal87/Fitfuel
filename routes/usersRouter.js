const express=require('express');
const router=express.Router();
const{registerUser,loginUser,logout}=require("../controllers/authcontroller")
const isLoggedin=require("../controllers/authcontroller");


router.get("/",function(req,res){
res.send("its working fine");
})
router.post("/register",registerUser)
router.post("/login",loginUser)
router.get("/logout",logout);

module.exports=router;