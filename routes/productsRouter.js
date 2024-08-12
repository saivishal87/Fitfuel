const express=require('express');
const router=express.Router();
const upload=require('../config/multer-config')
const productModel=require('../models/product-model')

router.post("/create", upload.single("image") ,async function(req,res){
try{
    let {name,price,discount,product_type,weight}=req.body;

let product=await productModel.create({
    image:req.file.buffer,
    name,
    price,
    discount,
    product_type,
    weight,
});
req.flash("success","product Created Sucessfully");
res.redirect("/owners/admin");
}
catch(err){
    res.send(err.message);
}
})
module.exports=router;