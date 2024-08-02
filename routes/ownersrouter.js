const express=require('express');
const router=express.Router();

router.get("/",function(req,res){
res.send("its working fine");
})
module.exports=router;